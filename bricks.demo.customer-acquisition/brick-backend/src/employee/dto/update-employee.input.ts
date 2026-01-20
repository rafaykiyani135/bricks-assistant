import { InputType, Field, ID, Float, PartialType } from '@nestjs/graphql';
import { CreateEmployeeInput } from './create-employee.input';

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {
  @Field(() => ID)
  id: number;
}