import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { EmployeeLoader } from '../employee/employee.loader';
import { ProjectLoader } from '../project/project.loader';
import { EmployeeModule } from '../employee/employee.module';
import { ProjectModule } from '../project/project.module';
import { GqlExceptionFilter } from '../common/filters/gql-exception.filter';

@Module({
  imports: [
    EmployeeModule,
    ProjectModule,

    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [EmployeeModule, ProjectModule],
      inject: [EmployeeLoader, ProjectLoader],

      useFactory: (
        employeeLoader: EmployeeLoader,
        projectLoader: ProjectLoader,
      ) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,

        context: ({ req }) => ({
          req,
          loaders: {
            employeeLoader: employeeLoader.loader,
            projectLoader: projectLoader.loader,
          },
        }),
        formatError: (error) => {
          const extensions = (error as any).extensions || {};
          // Si ya trae success false, retornamos tal cual (estandarizado por el filtro)
          if (extensions.success === false) {
            return extensions;
          }
          const code = extensions.code || 'INTERNAL_ERROR';
          return {
            success: false,
            code,
            message: error.message,
            details: extensions,
            timestamp: new Date().toISOString(),
            path: error.path,
          };
        },
      }),
    }),
  ],
})
export class GqlAppModule {}
