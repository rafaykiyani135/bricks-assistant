import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { CreateCustomerInput } from './create-customer.dto';

@InputType()
export class UpdateCustomerInput extends PartialType(
  OmitType(CreateCustomerInput, ['override']),
) {
  @Field(() => ID)
  @IsNotEmpty({ message: 'ID is required' })
  @IsString({ message: 'ID must be a string' })
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  @MaxLength(255, { message: 'Industry must not exceed 255 characters' })
  industry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;
}
