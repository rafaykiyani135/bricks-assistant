import {
  Args,
  ID,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Customer } from 'src/customers/customers.model';
import { CustomersService } from 'src/customers/customers.service';
import { InteractionSummariesLoader } from 'src/interaction-summaries/interaction-summaries.loader';
import { InteractionSummary } from 'src/interaction-summaries/interaction-summaries.model';
import { ContactPoint } from './contact-points.model';
import { ContactPointsService } from './contact-points.service';
import { CreateContactPointInput } from './dto/create-contact-point.dto';
import { UpdateContactPointInput } from './dto/update-contact-point.dto';

@Resolver(() => ContactPoint)
export class ContactPointsResolver {
  constructor(
    private readonly contactPointsService: ContactPointsService,
    private readonly customersService: CustomersService,
    private readonly interactionSummariesLoader: InteractionSummariesLoader,
  ) {}

  @Mutation(() => ContactPoint)
  async createContactPoint(@Args('input') input: CreateContactPointInput) {
    return this.contactPointsService.create(input);
  }

  @Mutation(() => ContactPoint)
  async updateContactPoint(@Args('input') input: UpdateContactPointInput) {
    return this.contactPointsService.update(input);
  }

  @Mutation(() => ContactPoint)
  async deleteContactPoint(@Args('id', { type: () => ID }) id: string) {
    return this.contactPointsService.delete(id);
  }

  @ResolveField(() => [Customer])
  async customer(@Parent() contactPoint: ContactPoint) {
    return this.customersService.findOne(contactPoint.customerId);
  }

  @ResolveField(() => [InteractionSummary], { name: 'interactions' })
  async getInteractions(@Parent() contactPoint: ContactPoint) {
    return this.interactionSummariesLoader.load(contactPoint.id);
  }
}
