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

  switch (action) {
    case 'publish':
      // publish the module item
      await canvasClient.modules.update(courseId, moduleId, {
        published: true,
      });
      // publish every child (assignment) under the module
      lesson?.children.forEach(async (assignment) => {
        canvasClient.assignments.update(assignment.id, courseId, {
          published: true,
        });
        // find any Github Assignments and ensure cohort team is added to repository
        const assignmentRepos: [string, string][] = [];
        switch(assignment.type) {
          case 'ExternalUrl':
            const match = assignment.external_url?.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
            if(match) {
              assignmentRepos.push([match[1], match[2]]);
            }
            break;  
          case 'Assignment':
            // go get the assignment
            const assignmentDetails = await canvasClient.assignments.get(assignment.id, courseId);
            // parse the description for github url
            const matched = assignmentDetails.description?.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/);
            if(matched) {
              assignmentRepos.push([matched[1], matched[2]]);
            }
            break;
        }

        // Grant access to any assignment repositories
        const github = new Github({ apiKey: process.env.GITHUB_TOKEN || '' });
        assignmentRepos.forEach(repo => {
          const [owner, repository] = repo;
          github.addTeamToRepository('fullstackacademy', '2504-FTB-ET-WEB-PT', owner, repository);
        })
      });
      break;
    case 'unpublish':
      // unpublish the module item
      await canvasClient.modules.update(courseId, moduleId, {
        published: false,
      });

      // unpublish all children (assignments)
      lesson?.children.forEach(assignment => {
        canvasClient.assignments.update(assignment.id, courseId, {
          published: false,
        });
      });
      break;
    case 'setDueDate':
      if(!dueDate) {
        logger.error('Attempted to set due date without value');
        return res.status(400).json({ status: 'error', message: 'Attempted to set due date without value' });
      }
      // set due date on all assignments
      lesson?.children.forEach(assignment => {
        canvasClient.assignments.update(assignment.id, courseId, {
          due_at: dueDate,
        });
      });
      break;
    default:
      logger.error('Invalid action', { action })
      break;
  }
  res.json({ status: 'ok' })
})

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
