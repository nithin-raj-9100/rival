import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TASK_TITLES = [
  'Redesign landing page hero section',
  'Fix OAuth token refresh bug',
  'Write API documentation for v2',
  'Set up CI/CD pipeline',
  'Implement dark mode toggle',
  'Optimize database queries',
  'Add email notification system',
  'Refactor auth middleware',
  'Create onboarding flow',
  'Migrate to TypeScript strict mode',
  'Build analytics dashboard',
  'Add rate limiting to API',
  'Design user profile page',
  'Fix mobile nav overflow',
  'Write unit tests for payment module',
  'Update dependencies to latest',
  'Implement file upload progress',
  'Create admin user management page',
  'Add search functionality to tasks',
  'Fix date picker timezone issue',
  'Set up error monitoring',
  'Build CSV export feature',
  'Create reusable modal component',
  'Add loading skeletons',
  'Implement infinite scroll',
  'Fix form validation edge cases',
  'Build notification preferences page',
  'Add webhook integration',
  'Create API rate dashboard',
  'Set up staging environment',
];

const DESCRIPTIONS = [
  null,
  'Need to match the new brand guidelines and improve conversion rates.',
  'Users reported that refreshing tokens fails intermittently in Safari.',
  'Document all new endpoints with request/response examples.',
  'Need linting, type checking, and test stages.',
  'Respect system preference with manual toggle override.',
  'The current queries are running full table scans. Need proper indexing.',
  'Transactional emails for signup, task reminders, and mentions.',
  'Extract shared auth logic into a composable middleware.',
  'Step-by-step flow for new users to set up their workspace.',
  'Running on strict mode revealed 200+ type errors.',
  'Real-time charts for task completion, user activity, and trends.',
  'Prevent abuse with token bucket per IP and per user.',
  'Include avatar upload, bio edit, and activity feed.',
  'The nav wraps awkwardly on phones in landscape mode.',
  'Cover edge cases around currency conversion and refunds.',
  'Major version bumps for React, Express, and Prisma.',
  'Show a progress bar with estimated time remaining.',
  'Allow admins to view, search, filter, and manage all users.',
  'Full-text search across all task fields with debounced input.',
  'Date pickers were one day off in UTC-5 and beyond.',
  'Sentry integration with source maps and alert rules.',
  'Download filtered task lists as CSV with all columns.',
  'One component to rule them all — confirm, form, info variants.',
  'Replace spinner with skeleton cards for better perceived performance.',
  'Whenever the user scrolls near the bottom, load more tasks.',
  'Numbers starting with 0 and leading spaces were being rejected.',
  'Allow users to toggle email, push, and in-app notifications.',
  'Support incoming webhooks from Slack, GitHub, and Stripe.',
  'Show per-endpoint latency, error rate, and request count.',
  'Mirror of production with anonymised data for QA testing.',
];

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number, daysForward: number): Date {
  const now = Date.now();
  const offset = Math.floor(Math.random() * (daysBack + daysForward + 1)) - daysBack;
  return new Date(now + offset * 24 * 60 * 60 * 1000);
}

async function seed() {
  console.log('Seeding database...');

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@taskman.app' },
      update: {},
      create: { email: 'demo@taskman.app', passwordHash, role: 'USER' },
    }),
    prisma.user.upsert({
      where: { email: 'admin@taskman.app' },
      update: {},
      create: { email: 'admin@taskman.app', passwordHash, role: 'ADMIN' },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  const [demoUser, adminUser] = users;

  // Clear existing tasks for demo user
  await prisma.activityLog.deleteMany({ where: { task: { userId: demoUser.id } } });
  await prisma.attachment.deleteMany({ where: { task: { userId: demoUser.id } } });
  await prisma.task.deleteMany({ where: { userId: demoUser.id } });

  // Generate 45 tasks spread across statuses and priorities
  const tasks = [];
  for (let i = 0; i < 45; i++) {
    tasks.push({
      title: TASK_TITLES[i % TASK_TITLES.length],
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      status: 'TODO',
      priority: PRIORITIES[i % 3], // cycles through LOW, MEDIUM, HIGH
      dueDate: i % 4 === 0 ? null : randomDate(7, 30),
      userId: demoUser.id,
      createdAt: randomDate(60, 0),
    });
  }

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log(`Created ${tasks.length} tasks for demo user`);
  console.log(`  Login: demo@taskman.app / password123`);
  console.log(`  Admin: admin@taskman.app / password123`);
  console.log('Done!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
