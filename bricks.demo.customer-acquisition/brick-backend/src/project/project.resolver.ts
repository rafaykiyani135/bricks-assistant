import { Resolver, Query, Mutation, Args, Int, ResolveField, Float, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guard/gql-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';

import { ProjectEntity  } from './project.entity';
import { ProjectService } from './project.service';
import { CreateProjectInput, UpdateProjectInput } from './project.input';
import { Job } from 'src/job/job.entity';

@Resolver(() =>   ProjectEntity)
export class ProjectResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => [ProjectEntity])
  projects() {
    return this.projectService.findAll();
  }

  @Query(() => ProjectEntity)
  project(@Args('id', { type: () => Int }) id: number) {
    return this.projectService.findById(id);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('EMPLOYEE','MANAGER','ADMIN')
  @Mutation(() => ProjectEntity)
  createProject(
    @Args('input') input: CreateProjectInput,
  ) {
    return this.projectService.create(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('EMPLOYEE','MANAGER','ADMIN')
  @Mutation(() => ProjectEntity)
  updateProject(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('client', { nullable: true }) client?: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('estimatedEndDate', { nullable: true }) estimatedEndDate?: string,
  ) {
    const input: UpdateProjectInput = {
      name,
      client,
      startDate,
      estimatedEndDate,
    };
    return this.projectService.update(id, input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('MANAGER','ADMIN')
  @Mutation(() => Boolean)
  deleteProject(@Args('id', { type: () => Int }) id: number) {
    return this.projectService.delete(id);
  }

  // --- Dynamic aggregate fields over jobs ---
@ResolveField(() => Float, { name: 'totalCost' })
async totalCost(@Parent() project: ProjectEntity, @Context('loaders') loaders): Promise<number> {
  const jobs = project.jobs || [];
  if (!jobs.length) return 0;

  // Obtener IDs únicos de empleados (excluyendo null, undefined y 0)
  const employeeIds = [...new Set(jobs
    .map(j => j.assignedEmployeeId)
    .filter(id => id !== null && id !== undefined && id > 0)
  )];
  
  // Si no hay empleados asignados, retornar 0
  if (employeeIds.length === 0) return 0;
  
  const loaded = await loaders.employeeLoader.loadMany(employeeIds);

  // Mapear IDs a empleados cargados
  const employeesMap = new Map<number, any>();
  loaded.forEach((res, idx) => {
    if (!(res instanceof Error) && employeeIds[idx] !== undefined) {
      employeesMap.set(employeeIds[idx], res);
    }
  });

  return jobs.reduce((sum, j) => {
    if (!j.assignedEmployeeId) return sum;
    const e = employeesMap.get(j.assignedEmployeeId);
    if (!e) return sum;
    const duration = j.estimatedComplexity / e.productivity;
    return sum + duration * e.hourlyCost;
  }, 0);
}

@ResolveField(() => Float, { name: 'totalPrice' })
async totalPrice(@Parent() project: ProjectEntity): Promise<number> {
  const jobs = project.jobs || [];
  return jobs.reduce((sum, j) => sum + (j.price || 0), 0);
}

}
