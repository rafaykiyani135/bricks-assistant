import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Job } from '../job/job.entity';
import { ProjectEntity } from '../project/project.entity';

@ObjectType()
export class QuoteSummary {
  @Field(() => ProjectEntity)
  project: ProjectEntity;

  @Field(() => [Job])
  jobs: Job[];

  @Field(() => Float)
  totalCost: number;

  @Field(() => Float)
  expectedRevenue: number;

  @Field(() => Float)
  netMargin: number;
}
