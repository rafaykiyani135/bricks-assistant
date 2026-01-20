import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../employee/employee.entity';
import { ProjectEntity } from '../project/project.entity';
import { JobCategory } from './job-category.enum';

@ObjectType('Job')
@Entity()
export class Job {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  title: string;

  @Field(() => String)
  @Column({ type: 'simple-enum', enum: JobCategory , default: JobCategory.OTHER})
  category: JobCategory;

  @Field(() => String)
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  estimatedStartDate: Date;

  @Field(() => String)
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  estimatedEndDate: Date;

  @Field(() => Float)
  @Column('float')
  estimatedComplexity: number;

  @Field(() => Float)
  @Column('float')
  price: number;

  @Field(() => Employee, { nullable: true })
  @ManyToOne(() => Employee, (e) => e.jobs)
  @JoinColumn({ name: 'assignedEmployeeId' })
  assignedEmployee: Employee;

  @Field(() => ProjectEntity)
  @ManyToOne(() => ProjectEntity, (p) => p.jobs)
  @JoinColumn({ name: 'projectId' })
  project: ProjectEntity;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  assignedEmployeeId?: number;

  @Field(() => ID)
  @Column()
  projectId: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { default: 0 })
  estimatedDuration?: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { default: 0 })
  estimatedCost?: number;
}
