import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobService } from './job.service';
import { Job } from './job.entity';
import { EmployeeService } from '../employee/employee.service';
import { ProjectService } from '../project/project.service';

describe('JobService', () => {
  let service: JobService;
  let repo: Repository<Job>;
  let employeeService: EmployeeService;
  let projectService: ProjectService;

  const repoMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  } as unknown as Repository<Job>;

  const employeeServiceMock = { findOne: jest.fn() } as unknown as EmployeeService;
  const projectServiceMock = { findById: jest.fn(), recalculate: jest.fn() } as unknown as ProjectService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JobService,
        { provide: getRepositoryToken(Job), useValue: repoMock },
        { provide: EmployeeService, useValue: employeeServiceMock },
        { provide: ProjectService, useValue: projectServiceMock },
      ],
    }).compile();

    service = moduleRef.get(JobService);
    repo = moduleRef.get(getRepositoryToken(Job));
    employeeService = moduleRef.get(EmployeeService);
    projectService = moduleRef.get(ProjectService);
    jest.clearAllMocks();
  });

  it('creates a job and triggers project recalculation', async () => {
    (employeeService.findOne as any).mockResolvedValue({ id: 7 });
    (projectService.findById as any).mockResolvedValue({ id: 3 });
    (repo.create as any).mockImplementation((dto) => ({ ...dto, id: 1 }));
    (repo.save as any).mockImplementation(async (j) => ({ ...j, id: j.id || 1 }));

    const input: any = {
      title: 'Implement feature',
      projectId: 3,
      assignedEmployeeId: 7,
      price: 1000,
      estimatedComplexity: 2,
    };

    const result = await service.create(input);
    expect(result.id).toBe(1);
    expect(projectService.recalculate).toHaveBeenCalledWith(3);
  });

  it('deletes a job and triggers project recalculation', async () => {
    (repo.findOne as any).mockResolvedValue({ id: 9, project: { id: 5 } });
    (repo.remove as any).mockResolvedValue(undefined);

    const success = await service.delete(9);
    expect(success).toBe(true);
    expect(projectService.recalculate).toHaveBeenCalledWith(5);
  });

  it('delete returns false if job not found', async () => {
    (repo.findOne as any).mockResolvedValue(undefined);
    const success = await service.delete(999);
    expect(success).toBe(false);
    expect(projectService.recalculate).not.toHaveBeenCalled();
  });
});
