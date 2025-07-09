import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, posix, relative, resolve } from 'node:path';

const DIST_DIR = resolve(process.cwd(), 'dist');
const MANIFEST_PATH = resolve(process.cwd(), 'manifest.json');

async function getJsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nestedFiles = await getJsFiles(fullPath);
      files.push(...nestedFiles);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(relative(DIST_DIR, fullPath).replace(/\\/g, '/'));
    }
  }
  return files;
}

async function updateManifest() {
  try {
    const manifestRaw = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest = JSON.parse(manifestRaw) as Record<string, unknown>;

    const jsFiles = await getJsFiles(DIST_DIR);
    if (jsFiles.length === 0) {
      throw new Error('No .js files found in dist directory.');
    }

    manifest.entry = jsFiles.length === 1 ? posix.join('dist', jsFiles[0]) : jsFiles.map((f) => posix.join('dist', f));

    await writeFile(MANIFEST_PATH, JSON.stringify(manifest), 'utf-8');

    console.log('Update manifest.json successfully.');
  } catch (err) {
    console.error('Error updating manifest:', err);
  }
}

updateManifest();
