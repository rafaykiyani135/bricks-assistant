import { Employee } from 'src/employee/employee.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Employee, { eager: true }) 
  @JoinColumn({ name: 'employeeId' })         
  employee: Employee;
  @Column()
  employeeId: number;
}
