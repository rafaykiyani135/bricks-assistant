# Full-Stack Code-to-IR Converter

A static analysis tool that converts **NestJS** (backend) and **Nuxt/Vue** (frontend) codebases into structured, machine-readable JSON Intermediate Representation (IR).

## Features

### Backend (NestJS)

- Extracts Controllers, Resolvers, Services, Modules, DTOs
- Tracks dependency relationships (Controller → Service, Service → Service)
- AST-driven parsing using Tree-sitter

### Frontend (Nuxt/Vue)

- Extracts Pages, Components, Stores, Composables
- **UI Labels**: Button text, placeholders, titles
- **Actions**: `@click`, `@submit` handlers
- **Form Fields**: `v-model` bindings with validation
- **Disabled States**: `:disabled` conditions

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Backend only
node dist/index.js --backend ../server/src

# Frontend only
node dist/index.js --frontend ../client/app

# Full-stack (recommended)
node dist/index.js --backend ../server/src --frontend ../client/app
```

## Output

Generates separate IR files in `output/`:

| File               | Contents                                                |
| ------------------ | ------------------------------------------------------- |
| `backend-ir.json`  | Modules, controllers, services, DTOs, relationships     |
| `frontend-ir.json` | Pages, components, stores, labels, actions, form fields |

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── types/ir.types.ts        # IR schema definitions
├── reader/file-reader.ts    # File traversal
├── parser/
│   ├── ts-parser.ts         # Tree-sitter wrapper
│   └── vue-parser.ts        # Vue SFC parser
├── extractors/              # Entity extractors
├── analyzers/               # Relationship analysis
└── builders/                # IR consolidation
```
