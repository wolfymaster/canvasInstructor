import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger, { stream } from './logger';
import dotenv from 'dotenv';
import canvasClient from './config/canvas';
import { getCourseByName } from './util';
import ModuleTree from './services/module/ModuleTree';

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

app.get('/course/modules', async (req: Request, res: Response) => {
  logger.info('Getting course modules', { course: req.canvas.client.config.course.name });
  const course = await getCourseByName(req.canvas, req.canvas.client.config.course.name);
  if(!course) {
    res.json({ status: 'error', message: `Unable to find course ${req.canvas.client.config.course.name}`})
  }
  const modules = await req.canvas.modules.getAll(course.id);
  res.json({ status: 'ok', data: modules });
});

app.get('/course/modules/:name', async (req: Request, res: Response) => {
  logger.info('Getting module', { course: req.canvas.client.config.course.name, module: req.params.name });
  const course = await getCourseByName(req.canvas, req.canvas.client.config.course.name);
  if(!course) {
    const message = `Unable to find course ${req.canvas.client.config.course.name}`;
    logger.error(message);
    return res.json({ status: 'error', message });
  }
  const modules = await req.canvas.modules.getAll(course.id);
  const module = modules.find(m => m.name.trim() === req.params.name);
  if(!module) {
    const message = `Unable to find module ${req.params.name}`;
    logger.error(message)
    return res.json({ status: 'error', message });
  }
  const moduleItems = await req.canvas.modules.items(course.id, ''+module.id);
  const tree = new ModuleTree(moduleItems)
  return res.json({ status: 'ok', data: tree });
});

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
