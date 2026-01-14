import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../customers/customers.model';
import { InteractionSummary } from '../interaction-summaries/interaction-summaries.model';

@ObjectType()
@Entity('contact_points')
export class ContactPoint {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field(() => ID)
  @Column()
  customerId: string;

  @Field(() => Customer)
  @ManyToOne(() => Customer, (customer) => customer.contactPoints)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Field(() => [InteractionSummary], { name: 'interactions' })
  @OneToMany(
    () => InteractionSummary,
    (interaction) => interaction.contactPoint,
  )
  interactions: InteractionSummary[];
}
