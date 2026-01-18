import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { ContactPointsModule } from 'src/contact-points/contact-points.module';
import { CustomersModule } from 'src/customers/customers.module';
import { EmployeesModule } from 'src/employees/employees.module';
import { HelloModule } from 'src/hello/hello.module';
import { InteractionSummariesModule } from 'src/interaction-summaries/interaction-summaries.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      graphiql: true,
    }),
    HelloModule,
    CustomersModule,
    ContactPointsModule,
    EmployeesModule,
    InteractionSummariesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
})
export class GqlModule {}
