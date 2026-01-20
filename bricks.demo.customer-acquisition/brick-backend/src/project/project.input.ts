import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  client: string;

  @Field(() => String)
  startDate: string;

  @Field(() => String)
  estimatedEndDate: string;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  client?: string;

  @Field(() => String, { nullable: true })
  startDate?: string;

  @Field(() => String, { nullable: true })
  estimatedEndDate?: string;
}
 