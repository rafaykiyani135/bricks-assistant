import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContactPoint } from '../contact-points/contact-points.model';
import { Employee } from '../employees/employees.model';

@ObjectType()
@Entity('interaction_summaries')
export class InteractionSummary {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('date')
  date: Date;

  @Field()
  @Column()
  type: string;

  @Field()
  @Column('text')
  message: string;

  @Field(() => ID)
  @Column()
  contactPointId: string;

  @Field(() => ID)
  @Column()
  employeeId: string;

  @Field(() => ContactPoint)
  @ManyToOne(() => ContactPoint, (contactPoint) => contactPoint.interactions)
  @JoinColumn({ name: 'contactPointId' })
  contactPoint: ContactPoint;

  @Field(() => Employee)
  @ManyToOne(() => Employee, (employee) => employee.interactions)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
