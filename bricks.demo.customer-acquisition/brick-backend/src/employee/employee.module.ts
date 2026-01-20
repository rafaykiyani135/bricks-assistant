import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { EmployeeService } from './employee.service';
import { EmployeeResolver } from './employee.resolver';
import { JobModule } from '../job/job.module';
import { EmployeeLoader } from './employee.loader';


@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    forwardRef(() => JobModule),
  ],
  providers: [EmployeeResolver, EmployeeService, EmployeeLoader],
  exports: [EmployeeService, EmployeeLoader],
})
export class EmployeeModule {}
