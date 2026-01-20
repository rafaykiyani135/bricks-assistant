import { Field, Float, InputType, Int } from "@nestjs/graphql";
import { JobCategory } from './job-category.enum';

@InputType()
export class CreateJobInput {
  @Field()
  title: string;

  @Field(() => JobCategory)
  category: JobCategory;

  @Field(() => Float)
  estimatedComplexity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Int, { nullable: true })
  assignedEmployeeId?: number;

  @Field(() => Int)
  projectId: number;
}

@InputType()
export class UpdateJobInput {
  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => JobCategory, { nullable: true })
  category?: JobCategory;

  @Field(() => Float, { nullable: true })
  estimatedComplexity?: number;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  assignedEmployeeId?: number;
}