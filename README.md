# NestJS Code-to-IR Converter

A static analysis tool that converts NestJS codebases into structured, machine-readable JSON Intermediate Representation (IR).

## Features

- **AST-driven parsing** using Tree-sitter (no regex)
- Extracts Controllers, Resolvers, Services, Modules, DTOs
- Tracks dependency relationships
- Produces deterministic, LLM-friendly JSON output

## Installation

```bash
npm install
```

## Usage

```bash
# Build the converter
npm run build

# Run against a NestJS project
npm run convert -- <path-to-nestjs-src>

# Example
npm run convert -- ../server/src
```

## Output

The converter generates `output/ir.json` containing:

- **modules**: NestJS module definitions
- **controllers**: REST controllers and GraphQL resolvers
- **services**: Injectable services with methods
- **dtos**: Input/DTO classes with validation decorators
- **relationships**: Dependency graphs

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── types/ir.types.ts        # IR schema definitions
├── reader/file-reader.ts    # File traversal
├── parser/ts-parser.ts      # Tree-sitter wrapper
├── extractors/              # Entity extractors
├── analyzers/               # Relationship analysis
└── builders/                # IR consolidation
```
