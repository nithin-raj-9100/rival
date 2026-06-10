import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler, AppError } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import attachmentRoutes from './routes/attachments';
import activityRoutes from './routes/activity';
import adminRoutes from './routes/admin';
import eventRoutes from './routes/events';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskId/attachments', attachmentRoutes);
app.use('/api/tasks/:taskId/activity', activityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Route not found'));
});

app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '4000');

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
