import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { App } from 'supertest/types';

interface GraphQLResponse {
  data?: {
    createCustomer?: {
      id?: string;
      name?: string;
      website?: string;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      originalError?: {
        message: string[];
        error: string;
        statusCode: number;
      };
    };
  }>;
}

describe('CustomersResolver (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('createCustomer mutation', () => {
    it('should create a new customer', () => {
      const mutation = `
        mutation {
          createCustomer(input: {
            name: "Test Customer"
            industry: "Test Industry"
          }) {
            name
            industry
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          const body = res.body as GraphQLResponse;

          expect(body.data?.createCustomer).toEqual({
            name: 'Test Customer',
            industry: 'Test Industry',
          });
        });
    });

    it('should return validation error when name is missing', () => {
      const mutation = `
        mutation {
          createCustomer(input: {
            name: ""
          }) {
            id
            name
            website
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          const body = res.body as GraphQLResponse;

          expect(body.errors).toBeDefined();
          expect(body.errors?.length).toBeGreaterThan(0);

          expect(body.errors?.[0].extensions?.originalError?.message).toContain(
            'Name is required',
          );
        });
    });

    it('should return validation error when website is invalid URL', () => {
      const mutation = `
        mutation {
          createCustomer(input: {
            name: "Test Customer"
            website: "invalid-url"
          }) {
            id
            name
            website
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .expect((res) => {
          const body = res.body as GraphQLResponse;

          expect(body.errors).toBeDefined();
          expect(body.errors?.length).toBeGreaterThan(0);

          expect(body.errors?.[0].extensions?.originalError?.message).toContain(
            'Website must be a valid URL',
          );
        });
    });
  });
});
