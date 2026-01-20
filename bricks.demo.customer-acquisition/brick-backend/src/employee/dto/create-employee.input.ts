import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateEmployeeInput {
  @Field()
  name: string;

  @Field(() => Float)
  hourlyCost: number;

  @Field(() => Float)
  productivity: number;

  @Field(() => String)
  role: string;
}
