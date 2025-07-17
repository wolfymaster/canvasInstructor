import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger, { stream } from './logger';
import dotenv from 'dotenv';
import canvasClient from './config/canvas';
import { getCourseByName } from './util';
import ModuleTree from './services/module/ModuleTree';
import Github from './lib/github';

declare global {
  namespace Express {
    interface Request {
      canvas: typeof canvasClient;
    }
  }
}

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined', { stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req: Request, res: Response, next: NextFunction) => {
  req.canvas = canvasClient;
  next();
});
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Something went wrong!' });
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  logger.info('Root endpoint accessed');
  res.json({ message: 'Welcome to the API' });
});

app.get('/course/:courseId/modules', async (req: Request, res: Response) => {
  logger.info('Getting course modules', { course: req.canvas.client.config.course.name });
  const course = await getCourseByName(req.canvas, req.canvas.client.config.course.name);
  if (!course) {
    return res.json({ status: 'error', message: `Unable to find course ${req.canvas.client.config.course.name}` })
  }
  const modules = await req.canvas.modules.getAll(course.id);
  res.json({ status: 'ok', data: modules });
});

app.get('/course/:courseId/modules/:moduleId', async (req: Request, res: Response) => {
  logger.info('Getting module', { course: req.canvas.client.config.course.name, module: req.params.name });
  const { courseId, moduleId } = req.params;
  const moduleItems = await req.canvas.modules.items(courseId, moduleId);
  const tree = new ModuleTree(moduleItems)
  return res.json({ status: 'ok', data: tree.json() });
});

app.post('/course/:courseId/modules/:moduleId/lesson', async (req: Request, res: Response) => {
  logger.info('Updating module', { course: req.canvas.client.config.course.name, module: req.params.name, body: req.body });
  const { courseId, moduleId } = req.params;
  const { lessonId, action, dueDate = null } = req.body;
  const moduleItems = await canvasClient.modules.items(courseId, moduleId);
  const lessons = new ModuleTree(moduleItems)
  const lesson = lessons.json().find(l => l.item.id === lessonId);

  if (!lesson) {
    logger.error('Failed to find lesson', { id: lessonId })
    return res.json({ status: 'error', message: 'Failed to find lesson' });
  }

  switch (action) {
    case 'publish':
      logger.info('Publishing Lesson', { lesson });
      // publish the module item
      await canvasClient.modules.updateItem(courseId, moduleId, String(lesson.item.id), {
        published: true,
      });

      // find any Github Assignments and ensure cohort team is added to repository
      const assignmentRepos: [string, string][] = [];

      // need to combine the lesson + its children
      const items = [lesson.item, ...lesson?.children];

      // publish every child (assignment) under the module
      for (let i = 0; i < items.length; ++i) {
        const assignment = items[i];
        const githubRegexPattern = /https?:\/\/github\.com\/([^\/]+)\/([^\/][a-zA-z0-9.-_]+)(?:\.git)?/;
        canvasClient.modules.updateItem(courseId, moduleId, String(assignment.id), { published: true });

        switch (assignment.type) {
          case 'ExternalUrl':
            const match = assignment.external_url?.match(githubRegexPattern);
            if (match) {
              assignmentRepos.push([match[1], match[2]]);
            }
            break;
          case 'Assignment':
            // go get the assignment
            if (!assignment.content_id) {
              logger.error('Unable to fetch assignment due to missing content id', { assignment });
              return;
            }
            const assignmentDetails = await canvasClient.assignments.get(assignment.content_id, courseId);

            // parse the description for github url
            const matched = assignmentDetails.description?.match(githubRegexPattern);
            if (matched) {
              assignmentRepos.push([matched[1], matched[2]]);
            }
            break;
        }
      }

      // Grant access to any assignment repositories
      if (assignmentRepos.length) {
        logger.info('Adding GitHub Repository Access to following repositories', { repositories: assignmentRepos });
        const github = new Github({ apiKey: process.env.GITHUB_TOKEN || '' });
        for (let i = 0; i < assignmentRepos.length; ++i) {
          const repo = assignmentRepos[i];
          const [owner, repository] = repo;
          // get the repository to ensure that we get the correct one (in the event the name has changed)
          const ghRepo = await github.getRepository(owner, repository);
          if(!ghRepo.success) {
            logger.error('Failed to find repository', { error: ghRepo.message, repository });
            continue;
          }
          const addTeamResult = await github.addTeamToRepository('fullstackacademy', req.canvas.client.config.course.name, owner, ghRepo.repository.name);
          if (!addTeamResult.success) {
            logger.error('Failed to add GitHub Repository', { error: addTeamResult.message, repository });
            continue;
          }

          logger.info('Added GitHub Repository Access', { owner, repository });
          continue;
        }
      }
      break;
    case 'unpublish':
      // unpublish the module item
      await canvasClient.modules.updateItem(courseId, moduleId, String(lesson.item.id), {
        published: false,
      });

      // unpublish all children (assignments)
      lesson?.children.forEach(assignment => {
        canvasClient.modules.updateItem(courseId, moduleId, String(assignment.id), { published: false });
      });
      break;
    case 'setDueDate':
      if (!dueDate) {
        logger.error('Attempted to set due date without value');
        return res.status(400).json({ status: 'error', message: 'Attempted to set due date without value' });
      }
      // set due date on all assignments
      lesson?.children.forEach(assignment => {
        switch (assignment.type) {
          case 'Assignment':
            if (!assignment.content_id) {
              return;
            }
            canvasClient.assignments.update(assignment.content_id, courseId, {
              due_at: new Date(`${dueDate}T22:59:00-04:00`),
            });
            break;
        };
      });
      break;
    default:
      logger.error('Invalid action', { action })
      break;
  }
  res.json({ status: 'ok' })
});

app.get('/course/:courseId/enrollments', async (req: Request, res: Response) => {
  logger.info('Getting grades', { course: req.canvas.client.config.course.name });
  const { courseId } = req.params;
  const enrollments = await req.canvas.enrollments.get(courseId);
  return res.json({ status: 'ok', data: enrollments });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
