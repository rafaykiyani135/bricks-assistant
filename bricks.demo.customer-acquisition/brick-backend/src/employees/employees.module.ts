import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employees.model';
import { EmployeesResolver } from './employees.resolver';
import { EmployeesService } from './employees.service';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  exports: [EmployeesService],
  providers: [EmployeesService, EmployeesResolver],
})
export class EmployeesModule {}
