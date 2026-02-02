#!/usr/bin/env node
/**
 * ESBuild Configuration for OMC CLI
 * AIDEV-NOTE: Bundles OCLIF CLI with ESM support and path aliases
 */

import { build } from 'esbuild';
import { glob } from 'glob';
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find all command files
const commandFiles = await glob('src/commands/**/*.ts', { cwd: __dirname });
const libFiles = await glob('src/lib/**/*.ts', { cwd: __dirname });
const storageFiles = await glob('src/storage/**/*.ts', { cwd: __dirname });
const rootLibFiles = await glob('lib/**/*.js', { cwd: __dirname });

// Build configuration
const buildConfig = {
  entryPoints: [
    'bin/omc.ts',
    'index.ts',
    ...commandFiles,
    ...libFiles,
    ...storageFiles,
    ...rootLibFiles,
  ],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outdir: 'dist',
  packages: 'external',
  splitting: true,
  sourcemap: true,
  // Path alias resolution
  alias: {
    '@lib': path.join(__dirname, 'src/lib'),
    '@storage': path.join(__dirname, 'src/storage'),
    '@analysis': path.join(__dirname, 'src/analysis'),
    '@generation': path.join(__dirname, 'src/generation'),
    '@publishing': path.join(__dirname, 'src/publishing'),
    '@workflows': path.join(__dirname, 'src/workflows'),
    '@utils': path.join(__dirname, 'src/utils'),
    '@omc-types': path.join(__dirname, 'src/types'),
  },
  // Preserve directory structure
  outbase: '.',
};

try {
  await build(buildConfig);

  // Copy schema files to dist (needed by chunk files)
  const schemaDir = path.join(__dirname, 'dist/schema');
  await mkdir(schemaDir, { recursive: true });
  await copyFile(
    path.join(__dirname, 'src/storage/schema/tracking-schema.sql'),
    path.join(schemaDir, 'tracking-schema.sql')
  );

  // Copy analysis prompt files (used at runtime by ContentAnalyzer)
  const promptDir = path.join(__dirname, 'dist/src/analysis/prompts');
  await mkdir(promptDir, { recursive: true });
  await copyFile(
    path.join(__dirname, 'src/analysis/prompts/analyze-article.md'),
    path.join(promptDir, 'analyze-article.md')
  );

  console.log('✅ Build complete');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
