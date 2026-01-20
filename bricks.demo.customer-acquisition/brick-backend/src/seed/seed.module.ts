import { Module } from '@nestjs/common';
import { SeedResolver } from './seed.resolver';

import { EmployeeModule } from '../employee/employee.module';
import { ProjectModule } from '../project/project.module';
import { JobModule } from '../job/job.module';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [
    EmployeeModule,
    ProjectModule,
    JobModule,
    UsersModule,
  ],
  providers: [SeedResolver],
})
export class SeedModule {}
