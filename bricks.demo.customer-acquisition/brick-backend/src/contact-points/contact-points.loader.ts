import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ContactPoint } from './contact-points.model';
import { ContactPointsService } from './contact-points.service';

@Injectable({ scope: Scope.REQUEST })
export class ContactPointsLoader {
  private readonly loader: DataLoader<string, ContactPoint[]>;

  constructor(private readonly contactPointsService: ContactPointsService) {
    this.loader = new DataLoader(async (customerIds) => {
      const contactPointsByCustomerId =
        await this.contactPointsService.findByCustomerIds(customerIds);

      return customerIds.map(
        (customerId) => contactPointsByCustomerId[customerId] ?? [],
      );
    });
  }

  load(customerId: string) {
    return this.loader.load(customerId);
  }
}
