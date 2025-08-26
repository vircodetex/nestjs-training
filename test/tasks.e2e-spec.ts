
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { TestSetup } from './utils/test-setup';
import { Task } from '../src/tasks/task.entity';
import { TaskStatus } from '../src/tasks/task.model';

describe('Tasks (e2e)', () => {
    let testSetup: TestSetup;
    let authToken: string;
    let taskId: string;

    const testUser = {
        email: 'test@example.com',
        password: 'passwordA123!',
        name: 'Test User'
    }

    beforeEach(async () => {
        testSetup = await TestSetup.create(AppModule);

        // Register an signin
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        const loginResponse = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(201);

        authToken = loginResponse.body.accessToken;

        // Create a task
        const response = await request(testSetup.app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Test Task', description: 'Test Description', status: TaskStatus.OPEN, labels: [{ name: 'test' }] })
            .expect(201);

        taskId = response.body.id;
    });

    afterEach(async () => {
        await testSetup.cleanup();
    });

    afterAll(async () => {
        await testSetup.tearDown();
    });

    it('Should not allow access to other users tasks', async () => {
        const otherUser = {
            ...testUser,
            email: 'other@example.com',
        }

        // Register an signin
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(otherUser)
            .expect(201);

        const otherLoginResponse = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: otherUser.email, password: otherUser.password })
            .expect(201);

        const otherAuthToken = otherLoginResponse.body.accessToken;

        await request(testSetup.app.getHttpServer())
            .get(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${otherAuthToken}`)
            .expect(403);
    });

    it('Should list users tasks only', async () => {
        await request(testSetup.app.getHttpServer())
            .get(`/tasks`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
            .expect(res => expect(res.body.meta.total).toBe(1));

        // otherUser is not supposed to list the tasks of testUser
        const otherUser = {
            ...testUser,
            email: 'other@example.com',
        }

        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(otherUser)
            .expect(201);

        const otherLoginResponse = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: otherUser.email, password: otherUser.password })
            .expect(201);

        const otherAuthToken = otherLoginResponse.body.accessToken;

        await request(testSetup.app.getHttpServer())
            .get(`/tasks`)
            .set('Authorization', `Bearer ${otherAuthToken}`)
            .expect(200)
            .expect(res => expect(res.body.meta.total).toBe(0));

    });


});
