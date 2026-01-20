import { ProjectEntity } from './project.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectResolver } from './project.resolver';
import { ProjectService } from './project.service';
import { JobModule } from '../job/job.module';
import { ProjectLoader } from './project.loader';
import { QuoteSummaryResolver } from './quote-summary.resolver';

@Module({
  imports: [
    forwardRef(() => JobModule),
    TypeOrmModule.forFeature([ProjectEntity]),
  ],
  providers: [
    ProjectResolver,
    ProjectService,
    ProjectLoader,
    QuoteSummaryResolver,
  ],
  exports: [ProjectService, ProjectLoader],
})
export class ProjectModule {}
