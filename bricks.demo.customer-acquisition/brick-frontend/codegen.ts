import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:3001/graphql',
  documents: 'app/**/*.graphql',
  ignoreNoDocuments: true,
  generates: {
    'app/__generated__/': {
      preset: 'client',
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: 'string',
        },
      },
    },
    'app/schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
