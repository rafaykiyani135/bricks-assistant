import { findFrontendFiles, getFileName } from './reader/file-reader';
import { extractComponents } from './extractors/vue-component.extractor';
import { extractStores } from './extractors/pinia-store.extractor';
import { buildFrontendIR } from './builders/ir-builder';
import { FrontendIR, StoreIR, ComposableIR } from './types/ir.types';

export function processFrontend(directory: string): FrontendIR {
  const { vueFiles, storeFiles, composableFiles } = findFrontendFiles(directory);
  console.log(`Found ${vueFiles.length} Vue files, ${storeFiles.length} stores, ${composableFiles.length} composables`);

  const { pages, components } = extractComponents(vueFiles);

  const allStores: StoreIR[] = [];
  for (const file of storeFiles) {
    try {
      const result = extractStores(file.content, file.relativePath);
      allStores.push(...result.items);
    } catch (error) {
      console.error(`Error processing ${file.relativePath}:`, error);
    }
  }

  const allComposables: ComposableIR[] = [];
  for (const file of composableFiles) {
    const name = getFileName(file.relativePath).replace('.ts', '');
    allComposables.push({
      name,
      file: file.relativePath,
      returns: [],
      apiCalls: [],
    });
  }

  return buildFrontendIR(pages, components, allStores, allComposables);
}
