import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Quitamos configuración duplicada de GraphQL; se centraliza en GqlAppModule.
import { join } from 'path';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeModule } from './employee/employee.module';
import { JobModule } from './job/job.module';
import { ProjectModule } from './project/project.module';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './auth/guard/roles.guard';
import { GqlAppModule } from './graphql/graphql.module';
import { EmployeeLoader } from './employee/employee.loader';
import { SeedResolver } from './seed/seed.resolver';
import { SeedModule } from './seed/seed.module';
import { LoggingModule } from './logging/logging.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [join(__dirname, '**/*.entity.{ts,js}')],
      synchronize: true,
      
    }),

    EmployeeModule,
    JobModule,
    UsersModule,
    ProjectModule,
    AuthModule,
    GqlAppModule,
    SeedModule,
    LoggingModule,
    MetricsModule
  ],
  providers: [RolesGuard, Reflector],
})
export class AppModule {}
