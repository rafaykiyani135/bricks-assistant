import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionSummariesLoader } from './interaction-summaries.loader';
import { InteractionSummary } from './interaction-summaries.model';
import { InteractionSummariesResolver } from './interaction-summaries.resolver';
import { InteractionSummariesService } from './interaction-summaries.service';

@Module({
  imports: [TypeOrmModule.forFeature([InteractionSummary])],
  providers: [
    InteractionSummariesService,
    InteractionSummariesResolver,
    InteractionSummariesLoader,
  ],
  exports: [InteractionSummariesService, InteractionSummariesLoader],
})
export class InteractionSummariesModule {}
