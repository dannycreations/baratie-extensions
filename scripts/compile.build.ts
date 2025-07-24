import { readdir, rm } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { build, InlineConfig } from 'vite';

interface TsFile {
  full: string;
  relative: string;
}

async function getFiles(dir: string, extensions: string[], rootDir = dir, files: TsFile[] = []): Promise<TsFile[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await getFiles(fullPath, extensions, rootDir, files);
    } else if (entry.isFile()) {
      const matchedExt = extensions.find((ext) => fullPath.endsWith(ext));
      if (matchedExt) {
        const relativePath = relative(rootDir, fullPath).replace(/\\/g, '/');
        files.push({ full: fullPath, relative: relativePath });
      }
    }
  }
  return files;
}

const INPUT_DIR = resolve(process.cwd(), 'src', 'extensions');
const OUTPUT_DIR = resolve(process.cwd(), 'dist');

async function main(): Promise<void> {
  await rm(OUTPUT_DIR, { recursive: true, force: true });

  const files = await getFiles(INPUT_DIR, ['.ts']);

  await Promise.all(
    files.map(async ({ full, relative }) => {
      try {
        const outDir = resolve(OUTPUT_DIR, dirname(relative));
        const config: InlineConfig = {
          build: {
            emptyOutDir: false,
            rollupOptions: {
              input: full,
              external: ['baratie'],
              output: {
                dir: outDir,
                entryFileNames: '[name].js',
                inlineDynamicImports: true,
              },
            },
            minify: 'terser',
            terserOptions: {
              compress: true,
              format: {
                beautify: false,
                comments: false,
              },
            },
          },
        };
        await build(config);
      } catch (err) {
        console.error(`Failed to build ${relative}:`, err);
      }
    }),
  );

  console.log('All builds successfully.');
}

main().catch(console.trace);
