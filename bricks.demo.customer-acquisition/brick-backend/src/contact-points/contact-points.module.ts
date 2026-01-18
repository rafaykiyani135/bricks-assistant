import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from 'src/customers/customers.module';
import { InteractionSummariesModule } from 'src/interaction-summaries/interaction-summaries.module';
import { ContactPointsLoader } from './contact-points.loader';
import { ContactPoint } from './contact-points.model';
import { ContactPointsResolver } from './contact-points.resolver';
import { ContactPointsService } from './contact-points.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactPoint]),
    InteractionSummariesModule,
    forwardRef(() => CustomersModule),
  ],
  providers: [ContactPointsService, ContactPointsResolver, ContactPointsLoader],
  exports: [ContactPointsService, ContactPointsLoader],
})
export class ContactPointsModule {}
