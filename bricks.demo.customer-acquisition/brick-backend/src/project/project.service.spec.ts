import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectService } from './project.service';
import { ProjectEntity } from './project.entity';
import { Job } from '../job/job.entity';

// Simple helper to build a job fixture
function job(partial: Partial<Job>): Job {
  return {
    id: partial.id ?? Math.floor(Math.random() * 1000),
    title: partial.title ?? 'Job',
    category: partial.category as any,
    estimatedStartDate: partial.estimatedStartDate ?? new Date('2025-01-01'),
    estimatedEndDate: partial.estimatedEndDate ?? new Date('2025-01-02'),
    estimatedComplexity: partial.estimatedComplexity ?? 1,
    price: partial.price ?? 0,
    assignedEmployee: partial.assignedEmployee as any,
    project: partial.project as any,
    assignedEmployeeId: partial.assignedEmployeeId,
    projectId: partial.projectId ?? 1,
    estimatedDuration: partial.estimatedDuration,
    estimatedCost: partial.estimatedCost,
  } as Job;
}

describe('ProjectService', () => {
  let service: ProjectService;
  let repo: Repository<ProjectEntity>;

  const queryBuilderMock = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const repoMock = {
    find: jest.fn(),
    findOne: jest.fn(),
    findBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
  } as unknown as Repository<ProjectEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getRepositoryToken(ProjectEntity), useValue: repoMock },
      ],
    }).compile();

    service = moduleRef.get(ProjectService);
    repo = moduleRef.get(getRepositoryToken(ProjectEntity));

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('throws when project not found', async () => {
      queryBuilderMock.getOne.mockResolvedValue(undefined);
      await expect(service.findById(123)).rejects.toThrow('Project not found');
    });

    it('returns project with relations', async () => {
      const project: ProjectEntity = {
        id: 1,
        name: 'P',
        client: 'ACME',
        startDate: new Date(),
        estimatedEndDate: new Date(),
        totalCost: 0,
        expectedRevenue: 0,
        netMargin: 0,
        jobs: [],
      };
      queryBuilderMock.getOne.mockResolvedValue(project);
      const result = await service.findById(1);
      expect(result).toBe(project);
      expect(repo.createQueryBuilder).toHaveBeenCalledWith('project');
    });
  });

  describe('recalculate', () => {
    it('updates financial fields based on jobs', async () => {
      const jobs: Job[] = [
        job({ price: 1000, estimatedCost: 300 }),
        job({ price: 500, estimatedCost: 100 }),
      ];
      const project: ProjectEntity = {
        id: 5,
        name: 'Demo',
        client: 'Client',
        startDate: new Date(),
        estimatedEndDate: new Date(),
        totalCost: 0,
        expectedRevenue: 0,
        netMargin: 0,
        jobs,
      };
      queryBuilderMock.getOne.mockResolvedValue(project);
      (repo.save as any).mockImplementation(async (p: ProjectEntity) => p);

      const updated = await service.recalculate(project.id);

      expect(updated.totalCost).toBe(400);
      expect(updated.expectedRevenue).toBe(1500);
      expect(updated.netMargin).toBe(1100);
      expect(repo.save).toHaveBeenCalledWith(project);
    });

    it('handles projects with no jobs', async () => {
      const project: ProjectEntity = {
        id: 9,
        name: 'Empty',
        client: undefined,
        startDate: undefined,
        estimatedEndDate: undefined,
        totalCost: 0,
        expectedRevenue: 0,
        netMargin: 0,
        jobs: [],
      };
      queryBuilderMock.getOne.mockResolvedValue(project);
      (repo.save as any).mockImplementation(async (p: ProjectEntity) => p);

      const updated = await service.recalculate(project.id);
      expect(updated.totalCost).toBe(0);
      expect(updated.expectedRevenue).toBe(0);
      expect(updated.netMargin).toBe(0);
    });
  });
});
