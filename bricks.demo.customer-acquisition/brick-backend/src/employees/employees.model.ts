import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InteractionSummary } from '../interaction-summaries/interaction-summaries.model';

@ObjectType()
@Entity('employees')
export class Employee {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field(() => [InteractionSummary], { name: 'interactions' })
  @OneToMany(() => InteractionSummary, (interaction) => interaction.employee)
  interactions: InteractionSummary[];
}
