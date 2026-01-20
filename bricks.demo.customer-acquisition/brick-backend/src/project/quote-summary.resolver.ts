import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ProjectService } from './project.service';
import { QuoteSummary } from './quote-summary.type';

@Resolver()
export class QuoteSummaryResolver {
  constructor(private projectService: ProjectService) {}

  @Query(() => QuoteSummary)
  async quoteSummary(
    @Args('projectId', { type: () => Int }) projectId: number,
  ) {
    return this.projectService.getQuoteSummary(projectId);
  }

  @Query(() => [QuoteSummary])
  async allProjectSummaries() {
    return this.projectService.getAllProjectSummaries();
  }
}
