import { ObjectType, Field } from '@nestjs/graphql';
import { Employee } from 'src/employee/employee.entity';

@ObjectType()
export class LoginResponse {
  @Field()
  token: string;

  @Field(() => Employee)
  employee: Employee;
}
