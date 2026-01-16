import { findTypeScriptFiles, classifyFile, getFileName } from './reader/file-reader';
import { extractControllers } from './extractors/controller.extractor';
import { extractServices } from './extractors/service.extractor';
import { extractModules } from './extractors/module.extractor';
import { extractDtos } from './extractors/dto.extractor';
import { analyzeRelationships } from './analyzers/relationship-analyzer';
import { buildBackendIR } from './builders/ir-builder';
import { ControllerIR, ServiceIR, ModuleIR, DtoIR, BackendIR } from './types/ir.types';

export function processBackend(directory: string): BackendIR {
  const files = findTypeScriptFiles(directory);
  console.log(`Found ${files.length} TypeScript files`);

  const allControllers: ControllerIR[] = [];
  const allServices: ServiceIR[] = [];
  const allModules: ModuleIR[] = [];
  const allDtos: DtoIR[] = [];

  for (const file of files) {
    const fileType = classifyFile(file.relativePath);

    try {
      switch (fileType) {
        case 'controller':
        case 'resolver': {
          const result = extractControllers(file.content, file.relativePath);
          allControllers.push(...result.items);
          break;
        }
        case 'service': {
          const result = extractServices(file.content, file.relativePath);
          allServices.push(...result.items);
          break;
        }
        case 'module': {
          const result = extractModules(file.content, file.relativePath);
          allModules.push(...result.items);
          break;
        }
        case 'dto': {
          const result = extractDtos(file.content, file.relativePath);
          allDtos.push(...result.items);
          break;
        }
        default: {
          const controllers = extractControllers(file.content, file.relativePath);
          const services = extractServices(file.content, file.relativePath);
          const modules = extractModules(file.content, file.relativePath);
          const dtos = extractDtos(file.content, file.relativePath);

          allControllers.push(...controllers.items);
          allServices.push(...services.items);
          allModules.push(...modules.items);
          allDtos.push(...dtos.items);
          break;
        }
      }
    } catch (error) {
      console.error(`Error processing ${file.relativePath}:`, error);
    }
  }

  const relationships = analyzeRelationships(allControllers, allServices, allModules);
  return buildBackendIR(allControllers, allServices, allModules, allDtos, relationships);
}
