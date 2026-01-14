import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ContactPoint } from './contact-points/contact-points.model';
import { Customer } from './customers/customers.model';
import { Employee } from './employees/employees.model';
import { GqlModule } from './graphql/graphql.module';
import { Hello } from './hello/hello.model';
import { InteractionSummary } from './interaction-summaries/interaction-summaries.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/sqlite.db',
      entities: [Hello, Customer, ContactPoint, Employee, InteractionSummary],
      synchronize: true,
    }),
    GqlModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
