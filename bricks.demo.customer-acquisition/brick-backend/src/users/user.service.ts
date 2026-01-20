import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { EmployeeService } from '../employee/employee.service';
import { CreateUserInput } from './dto/create-user-input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private employeeService: EmployeeService, // necesario para validar employeeId
  ) {}

  // Traer todos los usuarios
  findAll() {
    return this.repo.find(); // ya trae employee por eager:true
  }

  // Crear usuario
  async create(input: CreateUserInput) {
    // Validar que exista el empleado
    console.log('Creating user for employeeId:', input);
    const employee = await this.employeeService.findOne(input.employeeId);
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    // Validar que no exista ya un usuario asociado a ese employeeId (OneToOne => UNIQUE)
    const existing = await this.repo.findOne({ where: { employeeId: employee.id } });
    if (existing) {
      throw new BadRequestException('Employee already linked to a user');
    }

    const user = this.repo.create({
      email: input.email,
      username: input.username,
      password: input.password,
      employee: employee,       // asigna la relación
      employeeId: employee.id,  // necesario para la FK
    });

    return await this.repo.save(user);
  }

  // Buscar por ID
  findById(id: number) {
    return this.repo.findOneBy({ id });
  }

  // Buscar por email
  findByEmail(email: string) {
    return this.repo.findOneBy({ email });
  }
}
