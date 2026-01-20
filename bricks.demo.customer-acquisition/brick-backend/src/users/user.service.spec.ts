import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { EmployeeService } from '../employee/employee.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repo: Repository<User>;
  let employeeService: EmployeeService;

  const repoMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as Repository<User>;

  const employeeServiceMock = {
    findOne: jest.fn(),
  } as unknown as EmployeeService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repoMock },
        { provide: EmployeeService, useValue: employeeServiceMock },
      ],
    }).compile();

    service = moduleRef.get(UserService);
    repo = moduleRef.get(getRepositoryToken(User));
    employeeService = moduleRef.get(EmployeeService);
    jest.clearAllMocks();
  });

  it('creates a user successfully', async () => {
    (employeeService.findOne as any).mockResolvedValue({ id: 10 });
    (repo.findOne as any).mockResolvedValue(undefined); // no existing
    (repo.create as any).mockImplementation((dto) => dto);
    (repo.save as any).mockImplementation(async (u) => ({ id: 1, ...u }));

    const input = {
      email: 'test@example.com',
      username: 'tester',
      password: 'pass1234',
      employeeId: 10,
    };

    const user = await service.create(input as any);
    expect(user.id).toBe(1);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('fails when employee not found', async () => {
    (employeeService.findOne as any).mockRejectedValue(new NotFoundException('Employee not found'));
    await expect(
      service.create({
        email: 'x@x.com',
        username: 'x',
        password: '1234',
        employeeId: 99,
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('fails when employee already linked', async () => {
    (employeeService.findOne as any).mockResolvedValue({ id: 10 });
    (repo.findOne as any).mockResolvedValue({ id: 1, employeeId: 10 });
    await expect(
      service.create({
        email: 'dup@example.com',
        username: 'dup',
        password: '1234',
        employeeId: 10,
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
