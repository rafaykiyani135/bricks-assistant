import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeInput } from './dto/create-employee.dto';
import { UpdateEmployeeInput } from './dto/update-employee.dto';
import { Employee } from './employees.model';

@Injectable()
export class EmployeesService {
  constructor(@InjectRepository(Employee) private repo: Repository<Employee>) {}

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }

  async create(input: CreateEmployeeInput) {
    const employee = this.repo.create(input);
    return this.repo.save(employee);
  }

  async update(input: UpdateEmployeeInput) {
    const employee = await this.findOne(input.id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${input.id} not found`);
    }
    Object.assign(employee, input);
    return this.repo.save(employee);
  }
}
