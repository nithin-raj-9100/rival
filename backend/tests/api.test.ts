import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/prisma';

let tokenA: string;
let tokenB: string;
let taskId: string;

const userA = { email: 'a@test.com', password: 'password123' };
const userB = { email: 'b@test.com', password: 'password123' };

beforeAll(async () => {
  // Clean up test users if they exist
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany({ where: { email: { in: [userA.email, userB.email] } } });

  // Signup both users
  const resA = await request(app).post('/api/auth/signup').send(userA);
  tokenA = resA.body.token;

  const resB = await request(app).post('/api/auth/signup').send(userB);
  tokenB = resB.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
  // Let the server close naturally
  process.exit(0);
});

describe('Task CRUD', () => {
  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Test Task', description: 'A test', priority: 'HIGH' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Task');
    expect(res.body.priority).toBe('HIGH');
    expect(res.body.status).toBe('TODO');
    taskId = res.body.id;
  });

  it('should list tasks with pagination', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&limit=10')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
  });

  it('should fetch a single task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
    expect(res.body.title).toBe('Test Task');
  });

  it('should update a task', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Updated Task', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.status).toBe('IN_PROGRESS');
  });

  it('should delete a task', async () => {
    // Create a task to delete
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Delete Me' });

    const deleteRes = await request(app)
      .delete(`/api/tasks/${createRes.body.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/tasks/${createRes.body.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(getRes.status).toBe(404);
  });

  it('should filter tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=DONE')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.every((t: any) => t.status === 'DONE')).toBe(true);
  });

  it('should search tasks by title', async () => {
    const res = await request(app)
      .get('/api/tasks?search=Test')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    // At least the "Test Task" we created should match
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Authorization', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('user A cannot access user B tasks', async () => {
    // Create task for user A
    const resA = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: "A's Task" });

    // User B tries to access A's task
    const resB = await request(app)
      .get(`/api/tasks/${resA.body.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(403);
  });

  it('should validate required fields on create', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ description: 'No title' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
