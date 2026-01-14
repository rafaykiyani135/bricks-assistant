import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContactPoint } from './contact-points.model';
import { ContactPointsService } from './contact-points.service';
import { CreateContactPointInput } from './dto/create-contact-point.dto';
import { UpdateContactPointInput } from './dto/update-contact-point.dto';

type ContactPointModel = Omit<ContactPoint, 'interactions' | 'customer'>;

describe('ContactPointsService', () => {
  let service: ContactPointsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactPointsService,
        {
          provide: getRepositoryToken(ContactPoint),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContactPointsService>(ContactPointsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByCustomerId', () => {
    it('should return an array of contact points for a customer', async () => {
      const mockContactPoints: ContactPointModel[] = [
        {
          id: '1',
          name: 'John Doe',
          role: 'Manager',
          email: 'john@example.com',
          phone: '1234567890',
          customerId: '101',
        },
        {
          id: '2',
          name: 'Jane Smith',
          role: 'Developer',
          email: 'jane@example.com',
          customerId: '101',
        },
      ];

      mockRepository.find.mockResolvedValue(mockContactPoints);

      const result = await service.findByCustomerId('101');

      expect(result).toEqual(mockContactPoints);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { customerId: '101' },
        order: { name: 'ASC' },
      });
    });
  });

  describe('findByCustomerIds', () => {
    it('should return a record of contact points grouped by customerId', async () => {
      const mockContactPoints: ContactPointModel[] = [
        {
          id: '1',
          name: 'John Doe',
          customerId: '101',
        },
        {
          id: '2',
          name: 'Jane Smith',
          customerId: '101',
        },
        {
          id: '3',
          name: 'Bob Wilson',
          customerId: '102',
        },
      ];

      mockRepository.find.mockResolvedValue(mockContactPoints);

      const result = await service.findByCustomerIds(['101', '102']);

      expect(result).toEqual({
        '101': [mockContactPoints[0], mockContactPoints[1]],
        '102': [mockContactPoints[2]],
      });
    });

    it('should return empty object when customerIds array is empty', async () => {
      const result = await service.findByCustomerIds([]);

      expect(result).toEqual({});
      expect(mockRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('findByNameAndCustomerId', () => {
    it('should return a contact point when found', async () => {
      const mockContactPoint: ContactPointModel = {
        id: '1',
        name: 'John Doe',
        customerId: '101',
      };

      mockQueryBuilder.getOne.mockResolvedValue(mockContactPoint);

      const result = await service.findByNameAndCustomerId('John Doe', '101');

      expect(result).toEqual(mockContactPoint);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contactPoint',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(contactPoint.name) = LOWER(:name)',
        { name: 'John Doe' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contactPoint.customerId = :customerId',
        { customerId: '101' },
      );
    });

    it('should return null when contact point not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.findByNameAndCustomerId('John Doe', '101');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new contact point', async () => {
      const createInput: CreateContactPointInput = {
        customerId: '101',
        name: 'John Doe',
        role: 'Manager',
        email: 'john@example.com',
      };

      const mockCreatedContactPoint: ContactPointModel = {
        id: '1',
        ...createInput,
      };

      // Mock findByNameAndCustomerId to return null (no duplicate)
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCreatedContactPoint);
      mockRepository.save.mockResolvedValue(mockCreatedContactPoint);

      const result = await service.create(createInput);

      expect(result).toEqual(mockCreatedContactPoint);
      expect(mockRepository.create).toHaveBeenCalledWith(createInput);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedContactPoint);
    });

    it('should throw ConflictException when duplicate exists without override', async () => {
      const createInput: CreateContactPointInput = {
        customerId: '101',
        name: 'John Doe',
      };

      const existingContactPoint: ContactPointModel = {
        id: '1',
        name: 'John Doe',
        customerId: '101',
      };

      mockQueryBuilder.getOne.mockResolvedValue(existingContactPoint);

      await expect(service.create(createInput)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createInput)).rejects.toThrow('Duplicate');

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update existing contact point when override is true', async () => {
      const createInput: CreateContactPointInput = {
        customerId: '101',
        name: 'John Doe',
        role: 'New Role',
        email: 'newemail@example.com',
        override: true,
      };

      const existingContactPoint: ContactPointModel = {
        id: '1',
        name: 'John Doe',
        customerId: '101',
        role: 'Old Role',
        email: 'oldemail@example.com',
      };

      const updatedContactPoint: ContactPointModel = {
        ...existingContactPoint,
        role: 'New Role',
        email: 'newemail@example.com',
      };

      mockQueryBuilder.getOne.mockResolvedValue(existingContactPoint);
      mockRepository.save.mockResolvedValue(updatedContactPoint);

      const result = await service.create(createInput);

      expect(result).toEqual(updatedContactPoint);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedContactPoint);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing contact point', async () => {
      const existingContactPoint: ContactPointModel = {
        id: '1',
        name: 'John Doe',
        role: 'Manager',
        customerId: '101',
      };

      const updateInput: UpdateContactPointInput = {
        id: '1',
        role: 'Senior Manager',
        email: 'john@example.com',
      };

      const updatedContactPoint: ContactPointModel = {
        ...existingContactPoint,
        ...updateInput,
      };

      mockRepository.findOneBy.mockResolvedValue(existingContactPoint);
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue(updatedContactPoint);

      const result = await service.update(updateInput);

      expect(result).toEqual(updatedContactPoint);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedContactPoint);
    });

    it('should throw NotFoundException when contact point not found', async () => {
      const updateInput: UpdateContactPointInput = {
        id: '999',
        name: 'New Name',
      };

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(updateInput)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(updateInput)).rejects.toThrow(
        'ContactPoint with ID 999 not found',
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '999' });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when duplicate name exists', async () => {
      const existingContactPoint: ContactPointModel = {
        id: '1',
        name: 'John Doe',
        customerId: '101',
      };

      const updateInput: UpdateContactPointInput = {
        id: '1',
        name: 'Jane Smith',
      };

      const duplicateContactPoint: ContactPointModel = {
        id: '2',
        name: 'Jane Smith',
        customerId: '101',
      };

      mockRepository.findOneBy.mockResolvedValue(existingContactPoint);
      mockQueryBuilder.getOne.mockResolvedValue(duplicateContactPoint);

      await expect(service.update(updateInput)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(updateInput)).rejects.toThrow('Duplicate');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a contact point', async () => {
      const mockContactPoint: ContactPointModel = {
        id: '1',
        name: 'John Doe',
        customerId: '101',
      };

      mockRepository.findOneBy.mockResolvedValue(mockContactPoint);
      mockRepository.remove.mockResolvedValue(mockContactPoint);

      const result = await service.delete('1');

      expect(result).toEqual({ ...mockContactPoint, id: '1' });
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockContactPoint);
    });

    it('should throw NotFoundException when contact point not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundException);
      await expect(service.delete('999')).rejects.toThrow(
        'ContactPoint with ID 999 not found',
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '999' });
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
