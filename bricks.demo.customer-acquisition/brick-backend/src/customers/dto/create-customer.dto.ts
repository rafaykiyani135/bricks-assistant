import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

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

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean({ message: 'Override must be a boolean' })
  override?: boolean;
}
