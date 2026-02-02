import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { AnalysisRequest, ContentAnalysis } from '@omc-types/analysis.js';
import { withRetry } from '@lib/ai/retry.js';
import { spawnToString } from '@lib/ai/spawn-to-string.js';

export interface CodexCliUsageMetrics {
  note: string;
}

export interface CodexCliOptions {
  model?: string;
  codexHomeDir?: string;
  timeoutMs?: number;
  maxAttempts?: number;
}

export async function analyzeArticleWithCodexCli(
  request: AnalysisRequest,
  systemPrompt: string,
  options: CodexCliOptions = {}
): Promise<{ analysis: ContentAnalysis; usage: CodexCliUsageMetrics; raw: string }> {
  const prompt = buildPrompt(systemPrompt, request);
  const raw = await withRetry(() => runCodexExec(prompt, options), {
    maxAttempts: options.maxAttempts ?? 3,
  });
  const analysis = parseJsonObject<ContentAnalysis>(raw);
  return { analysis, usage: { note: 'Token/cost metrics not available via codex CLI' }, raw };
}

function buildPrompt(systemPrompt: string, request: AnalysisRequest): string {
  const header = [
    'You are a strict JSON generator.',
    'Do not run tools, commands, or read/write files.',
    'Return ONLY a single valid JSON object (no markdown, no prose).',
    systemPrompt.trim(),
    '',
    `Title: ${request.title}`,
    `URL: ${request.url}`,
    request.author ? `Author: ${request.author}` : null,
    request.publishedAt ? `Published: ${request.publishedAt}` : null,
    `Word Count: ${request.wordCount}`,
    '',
    request.highlights?.length ? formatHighlights(request.highlights) : null,
    'Content:',
    request.content,
  ]
    .filter(Boolean)
    .join('\n');

  return header + '\n';
}

function formatHighlights(highlights: AnalysisRequest['highlights']): string {
  const lines = ['User Highlights:'];
  for (const h of highlights) {
    lines.push(`- "${h.quote}"`);
    if (h.annotation) lines.push(`  Note: ${h.annotation}`);
  }
  return lines.join('\n') + '\n';
}

async function runCodexExec(prompt: string, options: CodexCliOptions): Promise<string> {
  const args = buildCodexArgs(options);
  const env = buildCodexEnv(options);
  const { code, stdout, stderr } = await spawnToString('codex', args, prompt, env, options.timeoutMs);
  if (code !== 0) throw new Error(`codex exec failed (exit ${code}): ${trimStderr(stderr)}`);
  return stdout.trim() || stderr.trim();
}

function buildCodexArgs(options: CodexCliOptions): string[] {
  const args = ['exec', '-s', 'read-only'];
  if (options.model) args.push('-m', options.model);
  args.push('-');
  return args;
}

function buildCodexEnv(options: CodexCliOptions): NodeJS.ProcessEnv {
  const codexHomeDir = options.codexHomeDir ?? join(process.cwd(), 'temp', 'codex-home');
  mkdirSync(codexHomeDir, { recursive: true });
  return { ...process.env, CODEX_HOME: codexHomeDir };
}

function parseJsonObject<T>(text: string): T {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object found in codex output');
  const json = text.slice(start, end + 1);
  return JSON.parse(json) as T;
}

function trimStderr(stderr: string): string {
  const value = stderr.trim();
  if (!value) return '(no stderr)';
  return value.length > 1200 ? value.slice(0, 1200) + '…' : value;
}
