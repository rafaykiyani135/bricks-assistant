import { ArgsType, Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Hello {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  constructor(name: string) {
    this.message = `Hello ${name}!`;
  }
}

/* Query DTO */
@ArgsType()
export class HelloQuery {
  message: string;
}
