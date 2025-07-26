import { readdir, readFile, writeFile } from 'node:fs/promises';
import { posix, relative, resolve } from 'node:path';

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

interface ManifestModule {
  name: string;
  category: string;
  description: string;
  entry: string;
}

interface ManifestContext {
  name: string;
  entry: string | string[] | ManifestModule[];
}

const MANIFEST_MODULE = true;
const MANIFEST: ManifestContext = {
  name: 'Sigma Ingredients',
  entry: [],
};

const INPUT_DIR = resolve('dist');
const MANIFEST_PATH = resolve('manifest.json');

async function main(): Promise<void> {
  const files = await getFiles(INPUT_DIR, ['.js']);
  if (files.length === 0) {
    throw new Error('No .js files found in dist directory.');
  }

  if (MANIFEST_MODULE) {
    const manifestEntries: ManifestModule[] = [];
    for (const file of files) {
      const content = await readFile(file.full, 'utf8');
      const match = content.match(/name:\s*['"]([^'"]+)['"],\s*category:\s*['"]([^'"]+)['"],\s*description:\s*['"]([^'"]+)['"],/);
      if (!match) {
        console.warn(`Could not extract manifest info from ${file.full}`);
        continue;
      }

      manifestEntries.push({
        name: match[1],
        category: match[2],
        description: match[3],
        entry: posix.join('dist', file.relative),
      });
    }
    MANIFEST.entry = manifestEntries;
  } else {
    if (files.length === 1) {
      MANIFEST.entry = posix.join('dist', files[0].relative);
    } else {
      MANIFEST.entry = files.map(({ relative }) => posix.join('dist', relative));
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(MANIFEST), 'utf8');

  console.log('Update manifest.json successfully.');
}

main().catch(console.trace);
