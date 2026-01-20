import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.entity';
import { NotFoundException } from '@nestjs/common';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let repo: Repository<Employee>;

  const repoMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  } as unknown as Repository<Employee>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: getRepositoryToken(Employee), useValue: repoMock },
      ],
    }).compile();

    service = moduleRef.get(EmployeeService);
    repo = moduleRef.get(getRepositoryToken(Employee));
    jest.clearAllMocks();
  });

  it('findOne returns employee', async () => {
    (repo.findOne as any).mockResolvedValue({ id: 1 });
    const emp = await service.findOne(1);
    expect(emp.id).toBe(1);
  });

  it('findOne throws if not found', async () => {
    (repo.findOne as any).mockResolvedValue(undefined);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
  });

  it('update merges and saves employee', async () => {
    (repo.findOne as any).mockResolvedValue({ id: 5, name: 'Old' });
    (repo.save as any).mockImplementation(async (e) => e);
    const updated = await service.update({ id: 5, name: 'New' } as any);
    expect(updated.name).toBe('New');
    expect(repo.save).toHaveBeenCalled();
  });

  it('delete returns true when affected > 0', async () => {
    (repo.delete as any).mockResolvedValue({ affected: 1 });
    const res = await service.delete(8);
    expect(res).toBe(true);
  });

  it('delete returns false when affected = 0', async () => {
    (repo.delete as any).mockResolvedValue({ affected: 0 });
    const res = await service.delete(9);
    expect(res).toBe(false);
  });
});
