// employee.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Employee } from './employee.entity';
import { EmployeeService } from './employee.service';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guard/gql-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Resolver(() => Employee)
export class EmployeeResolver {
  constructor(private service: EmployeeService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [Employee])
  employees() {
    return this.service.findAll();
  }

  @Query(() => Employee)
  employee(@Args('id', { type: () => ID }) id: number) {
    return this.service.findOne(id);
  }

  @Query(() => [Employee])
  employeesByIds(@Args('ids', { type: () => [ID] }) ids: number[]) {
    return this.service.findBy(ids);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('MANAGER','ADMIN')
  @Mutation(() => Employee)
  createEmployee(@Args('input') input: CreateEmployeeInput) {
    return this.service.create(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('MANAGER','ADMIN')
  @Mutation(() => Employee)
  updateEmployee(@Args('input') input: UpdateEmployeeInput) {
    return this.service.update(input);
  }

  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('MANAGER','ADMIN')
  @Mutation(() => Boolean)
  deleteEmployee(@Args('id', { type: () => ID }) id: number) {
    return this.service.delete(id);
  }
}
