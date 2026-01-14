import {
  Args,
  ID,
  Mutation,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { InteractionSummary } from 'src/interaction-summaries/interaction-summaries.model';
import { CreateEmployeeInput } from './dto/create-employee.dto';
import { UpdateEmployeeInput } from './dto/update-employee.dto';
import { Employee } from './employees.model';
import { EmployeesService } from './employees.service';

@Resolver(() => Employee)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Query(() => Employee, { name: 'employee', nullable: true })
  async getEmployee(@Args('id', { type: () => ID }) id: string) {
    return this.employeesService.findOne(id);
  }

  @Query(() => [Employee], { name: 'employees' })
  async getEmployees() {
    return this.employeesService.findAll();
  }

  @Mutation(() => Employee)
  async createEmployee(@Args('input') input: CreateEmployeeInput) {
    return this.employeesService.create(input);
  }

  @Mutation(() => Employee)
  async updateEmployee(@Args('input') input: UpdateEmployeeInput) {
    return this.employeesService.update(input);
  }

  @ResolveField(() => [InteractionSummary], { name: 'interactions' })
  async getInteractions() {
    return Promise.resolve([]);
  }
}
