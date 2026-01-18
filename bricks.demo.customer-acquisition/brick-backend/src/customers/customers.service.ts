import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customers.model';
import { CreateCustomerInput } from './dto/create-customer.dto';
import { UpdateCustomerInput } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private repo: Repository<Customer>) {}

  async findAll(): Promise<Customer[]> {
    return this.repo.find();
  }

  async findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async findByName(name: string): Promise<Customer | null> {
    return this.repo
      .createQueryBuilder('customer')
      .where('LOWER(customer.name) = LOWER(:name)', { name: name.trim() })
      .getOne();
  }

  async create(input: CreateCustomerInput) {
    // Check for duplicate name
    const existingCustomer = await this.findByName(input.name);

    if (existingCustomer) {
      if (input.override) {
        // Update existing customer with new fields
        Object.assign(existingCustomer, {
          industry: input.industry ?? existingCustomer.industry,
          website: input.website ?? existingCustomer.website,
        });
        return this.repo.save(existingCustomer);
      } else {
        // Throw duplicate error
        throw new ConflictException('Duplicate');
      }
    }

    // No duplicate, create new customer
    const customer = this.repo.create(input);
    return this.repo.save(customer);
  }

  async update(input: UpdateCustomerInput) {
    const customer = await this.findOne(input.id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${input.id} not found`);
    }

    // Check for duplicate name if name is being updated
    if (input.name && input.name !== customer.name) {
      const existingCustomer = await this.findByName(input.name);
      if (existingCustomer && existingCustomer.id !== input.id) {
        throw new ConflictException('Duplicate');
      }
    }

    Object.assign(customer, input);
    return this.repo.save(customer);
  }

  async delete(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    await this.repo.remove(customer);
    return { ...customer, id };
  }
}
