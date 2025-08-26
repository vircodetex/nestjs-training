
import request from 'supertest';

import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from './../src/app.module';
import { TestSetup } from './utils/test-setup';
import { User } from '../src/users/user.entity';
import { Role } from '../src/users/role.enum';
import { PasswordService } from '../src/users/password/password.service';

describe('Authentication and Authorization (e2e)', () => {
    let testSetup: TestSetup;

    beforeEach(async () => {
        testSetup = await TestSetup.create(AppModule);
    });

    afterEach(async () => {
        await testSetup.cleanup();
    });

    afterAll(async () => {
        await testSetup.tearDown();
    });

    const testUser = {
        email: 'test@example.com',
        password: 'passwordA123!',
        name: 'Test User'
    }

    it('Should require auth', async () => {
        //401 because authentication is missing and AuthGuard is global
        await request(testSetup.app.getHttpServer())
            .get('/tasks')
            .expect(401);
    });

    it('Should allow public route access', async () => {
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201);

        await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
            .expect(201);

    });

    it('Should include roles in JWT token', async () => {
        // This is the way to store a user
        // with admin role
        const userRepo = testSetup.app.get(getRepositoryToken(User));
        await userRepo.save({
            ...testUser,
            roles: [Role.ADMIN],
            password: await testSetup.app.get(PasswordService).hash(testUser.password)
        });

        const response = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const decoded = testSetup.app.get(JwtService).verify(response.body.accessToken);

        expect(decoded.roles).toBeDefined();
        expect(decoded.roles).toContain(Role.ADMIN);

    });

    it('/auth/register (POST)', async () => {
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(201)
            .expect(res => {
                expect(res.body.email).toBe(testUser.email);
                expect(res.body.name).toBe(testUser.name);
                expect(res.body).not.toHaveProperty('password');
            });
    });

    it('/auth/register (POST) - duplicate email', async () => {
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser);

        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser)
            .expect(409)
            .expect(res => {
                expect(res.body.message).toBe('Email already exists');
            });
    });

    it('/auth/login (POST)', async () => {
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser);

        const response = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        expect(response.status).toBe(201);
        expect(response.body.accessToken).toBeDefined();
    });

    it('/auth/profile (GET)', async () => {
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(testUser);

        const response = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const token = response.body.accessToken;

        await request(testSetup.app.getHttpServer())
            .get('/auth/profile')
            // Set the header
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect(res => {
                expect(res.body.email).toBe(testUser.email);
                expect(res.body.name).toBe(testUser.name);
                expect(res.body).not.toHaveProperty('password');
            });

        // Try again
        await request(testSetup.app.getHttpServer())
            .get('/auth/profile')
            // Set the header
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect(res => {
                expect(res.body.email).toBe(testUser.email);
                expect(res.body.name).toBe(testUser.name);
                expect(res.body).not.toHaveProperty('password');
            });

        // Try again with wrong token
        await request(testSetup.app.getHttpServer())
            .get('/auth/profile')
            // Set the header
            .set('Authorization', `Bearer anything-wrong`)
            .expect(401)
            .expect(res => {
                expect(res.body.message).toBe('Unauthorized');
            });
    });

    it('/auth/admin (GET) - admin access', async () => {
        const userRepo = testSetup.app.get(getRepositoryToken(User));
        await userRepo.save({
            ...testUser,
            roles: [Role.ADMIN],
            password: await testSetup.app.get(PasswordService).hash(testUser.password)
        });

        const response = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const token = response.body.accessToken;

        await request(testSetup.app.getHttpServer())
            .get('/auth/admin')
            // Set the header
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect(res => {
                expect(res.body.message).toBe('This is for admin only');
            });
    });

    it('/auth/admin (GET) - regular user denied', async () => {
        const userRepo = testSetup.app.get(getRepositoryToken(User));
        await userRepo.save({
            ...testUser,
            roles: [Role.USER],
            password: await testSetup.app.get(PasswordService).hash(testUser.password)
        });


        const response = await request(testSetup.app.getHttpServer())
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password });

        const token = response.body.accessToken;

        await request(testSetup.app.getHttpServer())
            .get('/auth/admin')
            // Set the header
            .set('Authorization', `Bearer ${token}`)
            .expect(403);
    });

    it('/auth/register (POST) - attempting to register as an admin', async () => {
        const userAdmin = { ...testUser, roles: [Role.ADMIN] };
        await request(testSetup.app.getHttpServer())
            .post('/auth/register')
            .send(userAdmin)
            .expect(201)
            .expect(res => {
                // User not ADMIN
                expect(res.body.roles).toEqual([Role.USER]);
            });
    });

});
