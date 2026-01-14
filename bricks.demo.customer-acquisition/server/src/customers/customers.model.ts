import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ContactPoint } from '../contact-points/contact-points.model';

@ObjectType()
@Entity('customers')
export class Customer {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  industry?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website?: string;

  @Field(() => [ContactPoint])
  @OneToMany(() => ContactPoint, (cp) => cp.customer)
  contactPoints: ContactPoint[];
}
