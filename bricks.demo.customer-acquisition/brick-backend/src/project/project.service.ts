import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { CreateProjectInput, UpdateProjectInput } from './project.input';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
  ) {}

  // ---------------------------------------------
  //  FINDERS
  // ---------------------------------------------
  async findAll(): Promise<ProjectEntity[]> {
    return this.projectRepo.find({
      relations: ['jobs', 'jobs.assignedEmployee'],
    });
  }

  async findById(id: number): Promise<ProjectEntity> {
    // Use query builder to get fresh data from database
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.jobs', 'job')
      .leftJoinAndSelect('job.assignedEmployee', 'employee')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  }

  async findByIds(ids: number[]): Promise<ProjectEntity[]> {
    return this.projectRepo.findBy({ id: In(ids) });
  }

  // ---------------------------------------------
  //  CREATE
  // ---------------------------------------------
  async create(input: CreateProjectInput): Promise<ProjectEntity> {
    const projectData = new ProjectEntity();
    projectData.name = input.name;
    projectData.client = input.client;
    projectData.startDate = input.startDate ? new Date(input.startDate) : undefined;
    projectData.estimatedEndDate = input.estimatedEndDate ? new Date(input.estimatedEndDate) : undefined;

    return this.projectRepo.save(projectData);
  }

  // ---------------------------------------------
  //  UPDATE
  // ---------------------------------------------
  async update(id: number, input: UpdateProjectInput): Promise<ProjectEntity> {
    console.log('UPDATE PROJECT - ID:', id, 'INPUT:', input);

    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['jobs', 'jobs.assignedEmployee']
    });

    if (!project) {
      throw new Error('Project not found');
    }

    console.log('BEFORE UPDATE:', { name: project.name, client: project.client });

    if (input.name !== undefined) {
      project.name = input.name;
    }
    if (input.client !== undefined) {
      project.client = input.client;
    }
    if (input.startDate !== undefined) {
      project.startDate = new Date(input.startDate);
    }
    if (input.estimatedEndDate !== undefined) {
      project.estimatedEndDate = new Date(input.estimatedEndDate);
    }

    console.log('AFTER UPDATE:', { name: project.name, client: project.client });

    const saved = await this.projectRepo.save(project);

    console.log('SAVED PROJECT:', { name: saved.name, client: saved.client });

    return saved;
  }

  // ---------------------------------------------
  //  PROJECT RECALCULATION
  // ---------------------------------------------
  async recalculate(projectId: number): Promise<ProjectEntity> {
    // Get fresh data directly from database using query builder
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.jobs', 'job')
      .leftJoinAndSelect('job.assignedEmployee', 'employee')
      .where('project.id = :id', { id: projectId })
      .getOne();

    if (!project) {
      throw new Error('Project not found');
    }

    const jobs = project.jobs ?? [];

    // ---------------------------------------------
    // DURACIÓN TOTAL (horas de complejidad)
    // ---------------------------------------------
    const totalDuration = jobs.reduce((sum, job) => {
      const complexity = job.estimatedComplexity || 0;
      return sum + complexity;
    }, 0);

    // ---------------------------------------------
    // COSTO TOTAL (en base a costos estimados de jobs)
    // ---------------------------------------------
    const totalCost = jobs.reduce((sum, job) => {
      const cost = job.estimatedCost || 0;
      return sum + cost;
    }, 0);

    // ---------------------------------------------
    // REVENUE
    // ---------------------------------------------
    const expectedRevenue = jobs.reduce((sum, job) => sum + job.price, 0);

    // ---------------------------------------------
    // NET MARGIN
    // ---------------------------------------------
    const netMargin = expectedRevenue - totalCost;

    // ---------------------------------------------
    // UPDATE PROJECT
    // ---------------------------------------------
    project.totalCost = totalCost;
    project.expectedRevenue = expectedRevenue;
    project.netMargin = netMargin;

    return this.projectRepo.save(project);
  }

  // ---------------------------------------------
  //  DELETE
  // ---------------------------------------------
  async delete(id: number): Promise<boolean> {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) return false;

    await this.projectRepo.remove(project);
    return true;
  }

  async getQuoteSummary(projectId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['jobs', 'jobs.assignedEmployee'],
    });

    if (!project) throw new Error('Project not found');

    const jobs = project.jobs;

    const totalCost = jobs.reduce(
      (sum, j) => sum + (j.estimatedComplexity / (j.assignedEmployee?.productivity || 1)),
      0,
    );
    const expectedRevenue = jobs.reduce((sum, j) => sum + (j.price || 0), 0);
    const netMargin = expectedRevenue > 0 ? ((expectedRevenue - totalCost) / expectedRevenue) * 100 : 0;

    return {
      project,
      jobs,
      totalCost,
      expectedRevenue,
      netMargin,
    };
  }

  async getAllProjectSummaries() {
    const projects = await this.projectRepo.find({
      relations: ['jobs', 'jobs.assignedEmployee'],
    });

    return projects.map(project => {
      const jobs = project.jobs;

      const totalCost = jobs.reduce(
        (sum, j) => sum + (j.estimatedComplexity / (j.assignedEmployee?.productivity || 1)),
        0,
      );
      const expectedRevenue = jobs.reduce((sum, j) => sum + (j.price || 0), 0);
      const netMargin = expectedRevenue > 0 ? ((expectedRevenue - totalCost) / expectedRevenue) * 100 : 0;

      return {
        project,
        jobs,
        totalCost,
        expectedRevenue,
        netMargin,
      };
    });
  }
}
