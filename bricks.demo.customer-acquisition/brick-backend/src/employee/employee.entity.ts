import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from '../job/job.entity';

@ObjectType()
@Entity()
export class Employee {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  get firstName(): string {
    return this.name ? this.name.split(' ')[0] : '';
  }

  @Field()
  get lastName(): string {
    if (!this.name) return '';
    const parts = this.name.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  @Field()
  @Column()
  role: string;

  @Field(() => Float)
  @Column('float')
  hourlyCost: number;

  @Field(() => Float)
  @Column('float')
  productivity: number;

  @OneToMany(() => Job, (job) => job.assignedEmployee)
  jobs?: Job[];
}
