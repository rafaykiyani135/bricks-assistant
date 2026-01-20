import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Employee } from '../employee/employee.entity';

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => Employee)
  employee: Employee;
}
