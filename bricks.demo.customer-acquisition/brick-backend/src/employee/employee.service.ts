import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeInput } from './dto/create-employee.input';
import { UpdateEmployeeInput } from './dto/update-employee.input';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  findAll(): Promise<Employee[]> {
    return this.employeeRepo.find({ relations: ['jobs'] });
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['jobs'],
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    return employee;
  }

  async findBy(ids: number[]): Promise<Employee[]> {
    return this.employeeRepo.findBy({ id: In(ids) });
  }

  async create(input: CreateEmployeeInput): Promise<Employee> {
    const emp = this.employeeRepo.create(input);
    return this.employeeRepo.save(emp);
  }

  async update(input: UpdateEmployeeInput): Promise<Employee> {
    const emp = await this.findOne(input.id);
    if (!emp) throw new NotFoundException('Employee not found');

    Object.assign(emp, input);
    return this.employeeRepo.save(emp);
  }

  async delete(id: number): Promise<boolean> {
    const res = await this.employeeRepo.delete(id);
    return (res.affected ?? 0) > 0;
  }
}
