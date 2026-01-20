import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from '../job/job.entity';

@ObjectType('Project')
@Entity()
export class ProjectEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  client?: string;

  @Field(() => String)
  @Column({ type: 'date' , nullable: true })
  startDate?: Date;

  @Field(() => String)
  @Column({ type: 'date', nullable: true })
  estimatedEndDate?: Date;

  @Field(() => Float, { nullable: true })
  @Column('float', { default: 0, nullable: true })
  totalCost: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { default: 0, nullable: true })
  expectedRevenue: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { default: 0, nullable: true })
  netMargin: number;

  @Field(() => [Job])
  @OneToMany(() => Job, (job) => job.project)
  jobs: Job[];

  // Campo calculado para el total de precios de jobs
  @Field(() => Float, { nullable: true })
  totalPrice?: number;
}
