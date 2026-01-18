import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ContactPointsLoader } from 'src/contact-points/contact-points.loader';
import { ContactPoint } from 'src/contact-points/contact-points.model';
import { InteractionSummariesLoader } from 'src/interaction-summaries/interaction-summaries.loader';
import { InteractionSummary } from 'src/interaction-summaries/interaction-summaries.model';
import { Customer } from './customers.model';
import { CustomersService } from './customers.service';
import { CreateCustomerInput } from './dto/create-customer.dto';
import { UpdateCustomerInput } from './dto/update-customer.dto';

@Resolver(() => Customer)
export class CustomersResolver {
  constructor(
    private readonly customersService: CustomersService,
    private readonly contactPointsLoader: ContactPointsLoader,
    private readonly interactionSummariesLoader: InteractionSummariesLoader,
  ) {}

  @Query(() => Customer, { name: 'customer', nullable: true })
  async getCustomer(@Args('id', { type: () => ID }) id: string) {
    return this.customersService.findOne(id);
  }

  @Query(() => [Customer], { name: 'customers' })
  async getCustomers() {
    return this.customersService.findAll();
  }

  @Mutation(() => Customer)
  async createCustomer(@Args('input') input: CreateCustomerInput) {
    return this.customersService.create(input);
  }

  @Mutation(() => Customer)
  async updateCustomer(@Args('input') input: UpdateCustomerInput) {
    return this.customersService.update(input);
  }

  @Mutation(() => Customer)
  async deleteCustomer(@Args('id', { type: () => ID }) id: string) {
    return this.customersService.delete(id);
  }

  @ResolveField(() => [ContactPoint], { name: 'contactPoints' })
  async getContactPoints(@Parent() customer: Customer) {
    return this.contactPointsLoader.load(customer.id);
  }

  @ResolveField(() => InteractionSummary, { nullable: true })
  async lastInteraction(@Parent() customer: Customer) {
    const contactPoints = await this.contactPointsLoader.load(customer.id);
    if (contactPoints.length === 0) {
      return null;
    }

    const contactPointIds = contactPoints.map((cp) => cp.id);
    const allInteractions = await Promise.all(
      contactPointIds.map((id) => this.interactionSummariesLoader.load(id)),
    );

    const flatInteractions = allInteractions.flat();
    if (flatInteractions.length === 0) {
      return null;
    }

    const mostRecent = flatInteractions.reduce((latest, current) => {
      const currentDate = new Date(current.date);
      const latestDate = new Date(latest.date);
      return currentDate > latestDate ? current : latest;
    });

    return mostRecent;
  }

  @ResolveField(() => Number)
  async interactionCount(@Parent() customer: Customer): Promise<number> {
    const contactPoints = await this.contactPointsLoader.load(customer.id);
    if (contactPoints.length === 0) {
      return 0;
    }

    const contactPointIds = contactPoints.map((cp) => cp.id);
    const allInteractions = await Promise.all(
      contactPointIds.map((id) => this.interactionSummariesLoader.load(id)),
    );

    return allInteractions.flat().length;
  }
}
