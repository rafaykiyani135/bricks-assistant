import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsEmail, MinLength, IsInt, Min } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @MinLength(3)
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(4)
  password: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  employeeId: number;
}
