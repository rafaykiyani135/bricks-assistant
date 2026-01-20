import { Resolver, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guard/gql-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EmployeeService } from '../employee/employee.service';
import { ProjectService } from '../project/project.service';
import { JobService } from '../job/job.service';
import { UserService } from '../users/user.service';
import { JobCategory } from 'src/job/job-category.enum';

@Resolver()
export class SeedResolver {
  constructor(
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private jobService: JobService,
    private userService: UserService,
  ) {}


  @Mutation(() => Boolean)
  async seed() {
    // EMPLOYEES
    const e1 = await this.employeeService.create({
      name: 'Juan Pérez',
      role: 'ADMIN',
      hourlyCost: 25,
      productivity: 1.0,
    });

    const e2 = await this.employeeService.create({
      name: 'María López',
      role: 'TECH',
      hourlyCost: 30,
      productivity: 1.2,
    });

    const e3 = await this.employeeService.create({
      name: 'Carlos Gómez',
      role: 'MANAGER',
      hourlyCost: 40,
      productivity: 1.0,
    });

    const e4 = await this.employeeService.create({
      name: 'Ana Rodríguez',
      role: 'EMPLOYEE',
      hourlyCost: 20,
      productivity: 0.9,
    });

    // USERS
    await this.userService.create({
      email: 'juan.admin@brickcode.com',
      username: 'juan_admin',
      password: 'admin123',
      employeeId: e1.id,
    });

    await this.userService.create({
      email: 'maria.tech@brickcode.com',
      username: 'maria_tech',
      password: 'tech123',
      employeeId: e2.id,
    });

    await this.userService.create({
      email: 'carlos.manager@brickcode.com',
      username: 'carlos_manager',
      password: 'manager123',
      employeeId: e3.id,
    });

    await this.userService.create({
      email: 'ana.employee@brickcode.com',
      username: 'ana_employee',
      password: 'employee123',
      employeeId: e4.id,
    });

    // PROJECTS
    const today = new Date().toISOString().split('T')[0]; // Convert to YYYY-MM-DD string
    const projectEndDate = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]; // One week from now

    const p1 = await this.projectService.create({
      name: 'Installation A',
      client: 'Client A',
      startDate: today,
      estimatedEndDate: projectEndDate,
    });
    
    const p2 = await this.projectService.create({
      name: 'Maintenance B',
      client: 'Client B',
      startDate: today,
      estimatedEndDate: projectEndDate,
    });

    // JOBS
    await this.jobService.create({
      title: 'Cable Routing',
      category: JobCategory.ELECTRICAL,
      estimatedComplexity: 2,
      assignedEmployeeId: e1.id,
      projectId: p1.id,
      price: 70,
    });

    await this.jobService.create({
      title: 'AC Install',
      category: JobCategory.OTHER,
      estimatedComplexity: 3,
      assignedEmployeeId: e1.id,
      projectId: p1.id,
      price: 150,
    });

    await this.jobService.create({
      title: 'Panel Maintenance',
      category: JobCategory.ELECTRICAL,
      estimatedComplexity: 4,
      assignedEmployeeId: e2.id,
      projectId: p2.id,
      price: 120,
    });

    return true;
  }
}
