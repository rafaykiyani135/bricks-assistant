import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateInteractionSummaryInput } from './dto/create-interaction-summary.dto';
import { InteractionSummary } from './interaction-summaries.model';
import { InteractionSummariesService } from './interaction-summaries.service';

@Resolver(() => InteractionSummary)
export class InteractionSummariesResolver {
  constructor(
    private readonly interactionSummariesService: InteractionSummariesService,
  ) {}

  @Mutation(() => InteractionSummary)
  async createInteractionSummary(
    @Args('input') input: CreateInteractionSummaryInput,
    @CurrentUser('sub') userId: string,
  ) {
    return this.interactionSummariesService.create(input, userId);
  }

  @ResolveField(() => Date, { name: 'date' })
  formatDate(@Parent() interaction: InteractionSummary) {
    return new Date(interaction.date);
  }
}
