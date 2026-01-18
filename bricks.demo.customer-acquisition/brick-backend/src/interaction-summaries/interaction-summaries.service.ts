import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateInteractionSummaryInput } from './dto/create-interaction-summary.dto';
import { InteractionSummary } from './interaction-summaries.model';

@Injectable()
export class InteractionSummariesService {
  constructor(
    @InjectRepository(InteractionSummary)
    private readonly interactionSummariesRepository: Repository<InteractionSummary>,
  ) {}

  async create(
    input: CreateInteractionSummaryInput,
    employeeId: string,
  ): Promise<InteractionSummary> {
    const interactionSummary = this.interactionSummariesRepository.create({
      ...input,
      employeeId,
    });
    return this.interactionSummariesRepository.save(interactionSummary);
  }

  async findByContactPointId(
    contactPointId: string,
  ): Promise<InteractionSummary[]> {
    return this.interactionSummariesRepository.find({
      where: { contactPointId },
      order: { date: 'DESC' },
    });
  }

  async findByContactPointIds(
    contactPointIds: readonly string[],
  ): Promise<Record<string, InteractionSummary[]>> {
    if (!contactPointIds.length) {
      return {};
    }

    const interactionSummaries = await this.interactionSummariesRepository.find(
      {
        where: { contactPointId: In([...new Set(contactPointIds)]) },
        order: { date: 'DESC' },
      },
    );

    return interactionSummaries.reduce<Record<string, InteractionSummary[]>>(
      (acc, interactionSummary) => {
        if (!acc[interactionSummary.contactPointId]) {
          acc[interactionSummary.contactPointId] = [];
        }

        acc[interactionSummary.contactPointId].push(interactionSummary);
        return acc;
      },
      {},
    );
  }
}
