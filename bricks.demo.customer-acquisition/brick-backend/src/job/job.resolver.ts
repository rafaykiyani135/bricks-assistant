import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
  Context,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guard/gql-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

import { Job } from './job.entity';
import { JobService } from './job.service';
import { CreateJobInput, UpdateJobInput } from './job.input';
import { JobCategory } from './job-category.enum';
import { Employee } from 'src/employee/employee.entity';
import { ProjectEntity } from 'src/project/project.entity';

@Resolver(() => Job)
export class JobResolver {
  constructor(private jobService: JobService) {}

  @Query(() => [Job])
  jobs() {
    return this.jobService.findAll();
  }

  @Query(() => Job)
  job(@Args('id', { type: () => Int }) id: number) {
    return this.jobService.findById(id);
  }

  // Protected: only authenticated users with role "EMPLOYEE" or "MANAGER" can create
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('EMPLOYEE','MANAGER','ADMIN')
  @Mutation(() => Job)
  createJob(
    @Args('title', { type: () => String }) title: string,
    @Args('category', { type: () => JobCategory }) category: JobCategory,
    @Args('estimatedComplexity', { type: () => Float }) estimatedComplexity: number,
    @Args('price', { type: () => Float }) price: number,
    @Args('projectId', { type: () => Int }) projectId: number,
    @Args('assignedEmployeeId', { type: () => Int, nullable: true }) assignedEmployeeId?: number,
  ) {
    const input: CreateJobInput = {
      title,
      category,
      estimatedComplexity,
      price,
      assignedEmployeeId,
      projectId
    };
    return this.jobService.create(input);
  }

  // Protected: only MANAGER or ADMIN can delete
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('MANAGER','ADMIN')
  @Mutation(() => Boolean)
  deleteJob(@Args('id', { type: () => Int }) id: number) {
    return this.jobService.delete(id);
  }

  // Protected: EMPLOYEE, MANAGER, ADMIN can update
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('EMPLOYEE','MANAGER','ADMIN')
  @Mutation(() => Job)
  async updateJob(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateJobInput,
  ) {
    return await this.jobService.update(id, input);
  }

  @ResolveField(() => Employee, { nullable: true })
  async employee(@Parent() job: Job, @Context('loaders') loaders) {
    if (!job.assignedEmployeeId || job.assignedEmployeeId <= 0 || job.assignedEmployeeId === null || job.assignedEmployeeId === undefined) {
      return null;
    }
    return loaders.employeeLoader.load(job.assignedEmployeeId);
  }

  @ResolveField(() => ProjectEntity)
  async project(@Parent() job: Job, @Context('loaders') loaders) {
    if (!job.projectId) {
      throw new Error('Job must have a projectId');
    }
    return loaders.projectLoader.load(job.projectId);
  }

  @ResolveField(() => Float, { nullable: true })
  async estimatedDuration(@Parent() job: Job, @Context('loaders') loaders) {
    if (!job.assignedEmployeeId || job.assignedEmployeeId <= 0 || job.assignedEmployeeId === null || job.assignedEmployeeId === undefined) {
      return null;
    }
    const employee = await loaders.employeeLoader.load(job.assignedEmployeeId);
    if (!employee) return null;
    return job.estimatedComplexity / employee.productivity;
  }

  @ResolveField(() => Float, { nullable: true })
  async estimatedCost(@Parent() job: Job, @Context('loaders') loaders) {
    if (!job.assignedEmployeeId || job.assignedEmployeeId <= 0 || job.assignedEmployeeId === null || job.assignedEmployeeId === undefined) {
      return null;
    }
    const employee = await loaders.employeeLoader.load(job.assignedEmployeeId);
    if (!employee) return null;
    const duration = job.estimatedComplexity / employee.productivity;
    return duration * employee.hourlyCost;
  }

  @ResolveField(() => Employee, { nullable: true })
  async assignedEmployee(@Parent() job: Job, @Context('loaders') loaders) {
    console.log('DEBUG assignedEmployee - job.assignedEmployeeId:', job.assignedEmployeeId, 'type:', typeof job.assignedEmployeeId);
    if (!job.assignedEmployeeId || job.assignedEmployeeId <= 0 || job.assignedEmployeeId === null || job.assignedEmployeeId === undefined) {
      return null;
    }
    try {
      return await loaders.employeeLoader.load(job.assignedEmployeeId);
    } catch (error) {
      console.error('Error loading employee:', error, 'for job:', job.id, 'employeeId:', job.assignedEmployeeId);
      return null;
    }
  }
}
