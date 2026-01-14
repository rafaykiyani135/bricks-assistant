import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContactPoint } from './contact-points.model';
import { CreateContactPointInput } from './dto/create-contact-point.dto';
import { UpdateContactPointInput } from './dto/update-contact-point.dto';

@Injectable()
export class ContactPointsService {
  constructor(
    @InjectRepository(ContactPoint)
    private readonly contactPointsRepository: Repository<ContactPoint>,
  ) {}

  async findByCustomerId(customerId: string): Promise<ContactPoint[]> {
    return this.contactPointsRepository.find({
      where: { customerId },
      order: { name: 'ASC' },
    });
  }

  async findByCustomerIds(
    customerIds: readonly string[],
  ): Promise<Record<string, ContactPoint[]>> {
    if (!customerIds.length) {
      return {};
    }

    const contactPoints = await this.contactPointsRepository.find({
      where: { customerId: In([...new Set(customerIds)]) },
      order: { name: 'ASC' },
    });

    return contactPoints.reduce<Record<string, ContactPoint[]>>(
      (acc, contactPoint) => {
        if (!acc[contactPoint.customerId]) {
          acc[contactPoint.customerId] = [];
        }

        acc[contactPoint.customerId].push(contactPoint);
        return acc;
      },
      {},
    );
  }

  async findByNameAndCustomerId(
    name: string,
    customerId: string,
  ): Promise<ContactPoint | null> {
    return this.contactPointsRepository
      .createQueryBuilder('contactPoint')
      .where('LOWER(contactPoint.name) = LOWER(:name)', { name: name.trim() })
      .andWhere('contactPoint.customerId = :customerId', { customerId })
      .getOne();
  }

  async findByEmailAndCustomerId(
    email: string,
    customerId: string,
  ): Promise<ContactPoint | null> {
    return this.contactPointsRepository
      .createQueryBuilder('contactPoint')
      .where('LOWER(contactPoint.email) = LOWER(:email)', {
        email: email.trim(),
      })
      .andWhere('contactPoint.customerId = :customerId', { customerId })
      .getOne();
  }

  async create(input: CreateContactPointInput): Promise<ContactPoint> {
    // Check for duplicate email first - NO override allowed
    if (input.email) {
      const existingByEmail = await this.findByEmailAndCustomerId(
        input.email,
        input.customerId,
      );
      if (existingByEmail) {
        throw new ConflictException('DuplicateEmail');
      }
    }

    // If email is not duplicate, check for duplicate name
    const existingByName = await this.findByNameAndCustomerId(
      input.name,
      input.customerId,
    );

    if (existingByName) {
      if (input.override) {
        // Update existing contact point with new fields
        Object.assign(existingByName, {
          role: input.role ?? existingByName.role,
          email: input.email ?? existingByName.email,
          phone: input.phone ?? existingByName.phone,
        });
        return this.contactPointsRepository.save(existingByName);
      } else {
        // Throw duplicate name error
        throw new ConflictException('DuplicateName');
      }
    }

    // No duplicate, create new contact point
    const contactPoint = this.contactPointsRepository.create(input);
    return this.contactPointsRepository.save(contactPoint);
  }

  async update(input: UpdateContactPointInput): Promise<ContactPoint> {
    const contactPoint = await this.contactPointsRepository.findOneBy({
      id: input.id,
    });
    if (!contactPoint) {
      throw new NotFoundException(`ContactPoint with ID ${input.id} not found`);
    }

    // Check for duplicate email first (priority) - NO override allowed
    if (input.email && input.email !== contactPoint.email) {
      const existingByEmail = await this.findByEmailAndCustomerId(
        input.email,
        contactPoint.customerId,
      );
      if (existingByEmail && existingByEmail.id !== input.id) {
        throw new ConflictException('DuplicateEmail');
      }
    }

    // If email is not duplicate, check for duplicate name - NO override in update mode
    if (input.name && input.name !== contactPoint.name) {
      const existingByName = await this.findByNameAndCustomerId(
        input.name,
        contactPoint.customerId,
      );
      if (existingByName && existingByName.id !== input.id) {
        throw new ConflictException('DuplicateName');
      }
    }

    Object.assign(contactPoint, input);
    return this.contactPointsRepository.save(contactPoint);
  }

  async delete(id: string): Promise<ContactPoint> {
    const contactPoint = await this.contactPointsRepository.findOneBy({ id });
    if (!contactPoint) {
      throw new NotFoundException(`ContactPoint with ID ${id} not found`);
    }
    await this.contactPointsRepository.remove(contactPoint);
    return { ...contactPoint, id };
  }
}
