import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/indicadores (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/indicadores')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('uf');
        expect(res.body).toHaveProperty('dolar');
      });
  });

  it('/api/dashboard (GET) without comuna should return 400', () => {
    return request(app.getHttpServer()).get('/api/dashboard').expect(400);
  });

  it('/api/dashboard (GET) with invalid comuna should return 404', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard?comuna=ComunaInexistente999')
      .expect(404);
  });

  it('/api/dashboard (GET) with valid comuna should return 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/dashboard?comuna=Santiago')
      .expect(200);

    expect(res.body).toHaveProperty('comuna', 'Santiago');
    expect(res.body).toHaveProperty('resumen_gasto');
    expect(res.body).toHaveProperty('contexto_economico');
  });

  afterAll(async () => {
    await app.close();
  });
});
