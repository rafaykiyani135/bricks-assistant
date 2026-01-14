import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from './customers.model';
import { CustomersService } from './customers.service';
import { CreateCustomerInput } from './dto/create-customer.dto';
import { UpdateCustomerInput } from './dto/update-customer.dto';

type CustomerModel = Omit<Customer, 'contactPoints'>;

describe('CustomersService', () => {
  let service: CustomersService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockQueryBuilder.where.mockReturnThis();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of customers', async () => {
      const mockCustomers: CustomerModel[] = [
        {
          id: '101',
          name: 'Morgan',
          industry: 'Tech',
          website: 'https://customer1.com',
        },
        {
          id: '102',
          name: 'Guillaume Baysset',
          industry: 'Finance',
          website: 'https://customer2.com',
        },
      ];

      mockRepository.find.mockResolvedValue(mockCustomers);

      const result = await service.findAll();

      expect(result).toEqual(mockCustomers);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const mockCustomer: CustomerModel = {
        id: '1',
        name: 'Dung Nguyen',
        industry: 'Tech',
        website: 'https://tuandung.online',
      };

      mockRepository.findOneBy.mockResolvedValue(mockCustomer);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should return null when customer not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne('1');

      expect(result).toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('create', () => {
    it('should create and save a new customer', async () => {
      const createInput: CreateCustomerInput = {
        name: 'New Customer',
        industry: 'Tech',
      };

      const mockCreatedCustomer: CustomerModel = {
        id: '101',
        ...createInput,
      };

      // Mock findByName to return null (no duplicate)
      mockQueryBuilder.getOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCreatedCustomer);
      mockRepository.save.mockResolvedValue(mockCreatedCustomer);

      const result = await service.create(createInput);

      expect(result).toEqual(mockCreatedCustomer);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'customer',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(customer.name) = LOWER(:name)',
        { name: 'New Customer' },
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createInput);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedCustomer);
    });
  });

  describe('update', () => {
    it('should update an existing customer', async () => {
      const existingCustomer: CustomerModel = {
        id: '1',
        name: 'Dung Nguyen',
      };

      const updateInput: UpdateCustomerInput = {
        id: '1',
        website: 'https://tuandung.online',
      };

      const updatedCustomer: CustomerModel = {
        ...existingCustomer,
        ...updateInput,
      };

      mockRepository.findOneBy.mockResolvedValue(existingCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update(updateInput);

      expect(result).toEqual(updatedCustomer);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedCustomer);
    });

    it('should throw NotFoundException when customer not found', async () => {
      const updateInput: UpdateCustomerInput = {
        id: '999',
        name: 'New Name',
      };

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(updateInput)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(updateInput)).rejects.toThrow(
        'Customer with ID 999 not found',
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: '999' });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
