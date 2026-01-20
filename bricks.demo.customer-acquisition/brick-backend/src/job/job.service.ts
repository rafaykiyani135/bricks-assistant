import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobInput } from './job.input';
import { ProjectService } from '../project/project.service';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/employee.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
  ) {}

  async findAll(): Promise<Job[]> {
    return this.jobRepo.find({ relations: ['assignedEmployee', 'project'] });
  }

  async findById(id: number): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['assignedEmployee', 'project'],
    });

    if (!job) throw new Error('Job not found');

    return job;
  }

  async create(input: CreateJobInput): Promise<Job> {
    const project = await this.projectService.findById(input.projectId);
    
    let assignedEmployee: Employee | undefined = undefined;
    if (input.assignedEmployeeId) {
      assignedEmployee = await this.employeeService.findOne(input.assignedEmployeeId);
    }

    const jobData: any = {
      title: input.title,
      category: input.category ?? null,
      estimatedComplexity: input.estimatedComplexity ?? 1,
      price: input.price,
      project,
    };

    if (assignedEmployee) {
      jobData.assignedEmployee = assignedEmployee;
      jobData.assignedEmployeeId = input.assignedEmployeeId;
    }

    const job = new Job();
    job.title = input.title;
    job.category = input.category ?? null;
    job.estimatedComplexity = input.estimatedComplexity ?? 1;
    job.price = input.price;
    job.project = project;
    
    if (assignedEmployee && input.assignedEmployeeId) {
      job.assignedEmployee = assignedEmployee;
      job.assignedEmployeeId = input.assignedEmployeeId;
    }

    const saved = await this.jobRepo.save(job);

    await this.projectService.recalculate(project.id);

    return saved;
  }

  async delete(id: number): Promise<boolean> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!job) return false;

    await this.jobRepo.remove(job);
    await this.projectService.recalculate(job.project.id);

    return true;
  }

  async update(id: number, input: Partial<{ title: string; category: any; estimatedComplexity: number; price: number; assignedEmployeeId: number; }>): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id },
      relations: ['assignedEmployee', 'project'],
    });
    if (!job) throw new Error('Job not found');

    if (input.title !== undefined) {
      job.title = input.title;
    }
    if (input.category !== undefined) {
      job.category = input.category;
    }
    if (input.estimatedComplexity !== undefined) {
      job.estimatedComplexity = input.estimatedComplexity;
    }
    if (input.price !== undefined) {
      job.price = input.price;
    }
    if (input.assignedEmployeeId !== undefined) {
      const employee = await this.employeeService.findOne(input.assignedEmployeeId);
      job.assignedEmployee = employee;
      job.assignedEmployeeId = employee.id;
    }

    const saved = await this.jobRepo.save(job);
    
    // Recalculate project metrics after job changes
    await this.projectService.recalculate(job.project.id);
    
    return saved;
  }
}
