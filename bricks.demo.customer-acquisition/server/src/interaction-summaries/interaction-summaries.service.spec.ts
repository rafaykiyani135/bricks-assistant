import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { CreateInteractionSummaryInput } from './dto/create-interaction-summary.dto';
import { InteractionSummary } from './interaction-summaries.model';
import { InteractionSummariesService } from './interaction-summaries.service';

type InteractionSummaryModel = Omit<
  InteractionSummary,
  'contactPoint' | 'employee'
>;

describe('InteractionSummariesService', () => {
  let service: InteractionSummariesService;

  const mockRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionSummariesService,
        {
          provide: getRepositoryToken(InteractionSummary),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InteractionSummariesService>(
      InteractionSummariesService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new interaction summary', async () => {
      const createInput: CreateInteractionSummaryInput = {
        contactPointId: 'contact-point-1',
        date: '2024-01-15',
        type: 'Email',
        message: 'Initial contact',
      };

      const employeeId = 'employee-1';

      const mockCreatedInteractionSummary: InteractionSummaryModel = {
        id: 'interaction-1',
        ...createInput,
        date: new Date(createInput.date),
        employeeId,
      };

      mockRepository.create.mockReturnValue(mockCreatedInteractionSummary);
      mockRepository.save.mockResolvedValue(mockCreatedInteractionSummary);

      const result = await service.create(createInput, employeeId);

      expect(result).toEqual(mockCreatedInteractionSummary);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createInput,
        employeeId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        mockCreatedInteractionSummary,
      );
    });
  });

  describe('findByContactPointId', () => {
    it('should return an array of interaction summaries for a contact point', async () => {
      const contactPointId = 'contact-point-1';
      const mockInteractionSummaries: InteractionSummaryModel[] = [
        {
          id: 'interaction-1',
          date: new Date('2024-01-15'),
          type: 'Email',
          message: 'First contact',
          contactPointId,
          employeeId: 'employee-1',
        },
        {
          id: 'interaction-2',
          date: new Date('2024-01-10'),
          type: 'Call',
          message: 'Follow-up call',
          contactPointId,
          employeeId: 'employee-1',
        },
      ];

      mockRepository.find.mockResolvedValue(mockInteractionSummaries);

      const result = await service.findByContactPointId(contactPointId);

      expect(result).toEqual(mockInteractionSummaries);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { contactPointId },
        order: { date: 'DESC' },
      });
    });

    it('should return an empty array when no interaction summaries found', async () => {
      const contactPointId = 'non-existent-contact-point';

      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByContactPointId(contactPointId);

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { contactPointId },
        order: { date: 'DESC' },
      });
    });
  });

  describe('findByContactPointIds', () => {
    it('should return a record mapping contact point ids to interaction summaries', async () => {
      const contactPointIds = ['contact-point-1', 'contact-point-2'];
      const mockInteractionSummaries: InteractionSummaryModel[] = [
        {
          id: 'interaction-1',
          date: new Date('2024-01-15'),
          type: 'Email',
          message: 'First contact',
          contactPointId: 'contact-point-1',
          employeeId: 'employee-1',
        },
        {
          id: 'interaction-2',
          date: new Date('2024-01-10'),
          type: 'Call',
          message: 'Follow-up call',
          contactPointId: 'contact-point-1',
          employeeId: 'employee-1',
        },
        {
          id: 'interaction-3',
          date: new Date('2024-01-12'),
          type: 'Meeting',
          message: 'Product demo',
          contactPointId: 'contact-point-2',
          employeeId: 'employee-2',
        },
      ];

      mockRepository.find.mockResolvedValue(mockInteractionSummaries);

      const result = await service.findByContactPointIds(contactPointIds);

      expect(result).toEqual({
        'contact-point-1': [
          mockInteractionSummaries[0],
          mockInteractionSummaries[1],
        ],
        'contact-point-2': [mockInteractionSummaries[2]],
      });
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { contactPointId: In(['contact-point-1', 'contact-point-2']) },
        order: { date: 'DESC' },
      });
    });

    it('should handle duplicate contact point ids', async () => {
      const contactPointIds = ['contact-point-1', 'contact-point-1'];
      const mockInteractionSummaries: InteractionSummaryModel[] = [
        {
          id: 'interaction-1',
          date: new Date('2024-01-15'),
          type: 'Email',
          message: 'First contact',
          contactPointId: 'contact-point-1',
          employeeId: 'employee-1',
        },
      ];

      mockRepository.find.mockResolvedValue(mockInteractionSummaries);

      const result = await service.findByContactPointIds(contactPointIds);

      expect(result).toEqual({
        'contact-point-1': [mockInteractionSummaries[0]],
      });
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { contactPointId: In(['contact-point-1']) },
        order: { date: 'DESC' },
      });
    });

    it('should return an empty object when no contact point ids provided', async () => {
      const result = await service.findByContactPointIds([]);

      expect(result).toEqual({});
      expect(mockRepository.find).not.toHaveBeenCalled();
    });

    it('should return an empty object when no interaction summaries found', async () => {
      const contactPointIds = ['non-existent-contact-point'];

      mockRepository.find.mockResolvedValue([]);

      const result = await service.findByContactPointIds(contactPointIds);

      expect(result).toEqual({});
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          contactPointId: In(['non-existent-contact-point']),
        },
        order: { date: 'DESC' },
      });
    });
  });
});
