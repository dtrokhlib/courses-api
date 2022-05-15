import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthDto } from '../src/auth/dto/auth.dto';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import {
    ALREADY_REGISTERED_ERROR,
    USER_NOT_FOUND_ERROR,
    WRONG_PASSWORD_ERROR,
} from '../src/auth/auth.constants';

const loginDto: AuthDto = {
    login: 'test@test.com',
    password: 'test5',
};

const invalidLoginDto: AuthDto = {
    login: 'test',
    password: 'test',
};

describe('Auth (e2e)', () => {
    let app: INestApplication;
    let token;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/auth/register (POST) - fail field validation', async () => {
        const { body } = await request(app.getHttpServer())
            .post('/auth/register')
            .send(invalidLoginDto)
            .expect(400);

        expect(body.message.length).toBe(2);
    });

    it('/auth/register (POST) - fail login is already used', async () => {
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(loginDto)
            .expect(400, {
                statusCode: 400,
                message: ALREADY_REGISTERED_ERROR,
                error: 'Bad Request',
            });
    });

    it('/auth/login (POST) - fail user is not exist', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ ...loginDto, login: 'not@exist.com' })
            .expect(401, {
                statusCode: 401,
                message: USER_NOT_FOUND_ERROR,
                error: 'Unauthorized',
            });
    });

    it('/auth/login (POST) - fail incorrect password', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ ...loginDto, password: 'incorrect.password' })
            .expect(401, {
                statusCode: 401,
                message: WRONG_PASSWORD_ERROR,
                error: 'Unauthorized',
            });
    });

    it('/auth/login (POST) - success', async () => {
        const { body } = await request(app.getHttpServer())
            .post('/auth/login')
            .send(loginDto)
            .expect(200);

        expect(body.access_token).toBeDefined();
    });

    afterAll(() => {
        disconnect();
    });
});
