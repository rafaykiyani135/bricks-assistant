import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobResolver } from './job.resolver';
import { EmployeeModule } from '../employee/employee.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [forwardRef(() => EmployeeModule),
    forwardRef(() => ProjectModule),
    
    TypeOrmModule.forFeature([Job]),
  ],
  providers: [JobResolver, JobService],
  exports: [JobService],
})
export class JobModule {}
