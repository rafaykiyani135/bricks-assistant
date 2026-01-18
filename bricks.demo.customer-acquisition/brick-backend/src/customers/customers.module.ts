import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionSummariesModule } from 'src/interaction-summaries/interaction-summaries.module';
import { ContactPointsModule } from '../contact-points/contact-points.module';
import { Customer } from './customers.model';
import { CustomersResolver } from './customers.resolver';
import { CustomersService } from './customers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    forwardRef(() => ContactPointsModule),
    forwardRef(() => InteractionSummariesModule),
  ],
  exports: [CustomersService],
  providers: [CustomersService, CustomersResolver],
})
export class CustomersModule {}
