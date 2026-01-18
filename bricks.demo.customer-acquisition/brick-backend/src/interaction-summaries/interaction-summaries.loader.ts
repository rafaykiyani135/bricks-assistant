import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { InteractionSummary } from './interaction-summaries.model';
import { InteractionSummariesService } from './interaction-summaries.service';

@Injectable({ scope: Scope.REQUEST })
export class InteractionSummariesLoader {
  private readonly loader: DataLoader<string, InteractionSummary[]>;

  constructor(
    private readonly interactionSummariesService: InteractionSummariesService,
  ) {
    this.loader = new DataLoader(async (contactPointIds) => {
      const interactionSummariesByContactPointId =
        await this.interactionSummariesService.findByContactPointIds(
          contactPointIds,
        );

      return contactPointIds.map(
        (contactPointId) =>
          interactionSummariesByContactPointId[contactPointId] ?? [],
      );
    });
  }

  load(contactPointId: string) {
    return this.loader.load(contactPointId);
  }
}
