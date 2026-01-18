import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Hello } from './hello.model';
import { HelloService } from './hello.service';

describe('HelloService', () => {
  let service: HelloService;

  const mockRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelloService,
        {
          provide: getRepositoryToken(Hello),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<HelloService>(HelloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
