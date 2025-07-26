import { readdir, rm } from 'node:fs/promises';
import { posix } from 'node:path';
import { build, InlineConfig, mergeConfig } from 'vite';

import viteConfig from '../vite.config';

interface TsFile {
  full: string;
  relative: string;
}

async function getFiles(dir: string, extensions: string[], rootDir = dir, files: TsFile[] = []): Promise<TsFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = posix.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await getFiles(fullPath, extensions, rootDir, files);
    } else if (entry.isFile()) {
      const matchedExt = extensions.find((ext) => fullPath.endsWith(ext));
      if (matchedExt) {
        const relativePath = posix.relative(rootDir, fullPath);
        files.push({ full: fullPath, relative: relativePath });
      }
    }
  }
  return files;
}

const INPUT_DIR = posix.resolve('src', 'extensions');
const OUTPUT_DIR = posix.resolve('dist');

async function main(): Promise<void> {
  await rm(OUTPUT_DIR, { recursive: true, force: true });

  const files = await getFiles(INPUT_DIR, ['.ts']);

  await Promise.all(
    files.map(async ({ full, relative }) => {
      try {
        const outDir = posix.resolve(OUTPUT_DIR, posix.dirname(relative));
        await build(
          mergeConfig(viteConfig, {
            build: {
              emptyOutDir: false,
              rollupOptions: {
                input: full,
                output: {
                  dir: outDir,
                  entryFileNames: '[name].js',
                  inlineDynamicImports: true,
                },
              },
            },
          } satisfies InlineConfig),
        );
      } catch (err) {
        console.error(`Failed to build ${relative}:`, err);
      }
    }),
  );

  console.log('All builds successfully.');
}

main().catch(console.trace);
