import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { AnalysisRequest, ContentAnalysis } from '@omc-types/analysis.js';
import { analyzeArticleWithCodexCli } from '@lib/ai/codex-cli-client.js';

export interface AnalyzeArticleInput extends AnalysisRequest {
  articleId: string;
}

export interface ContentAnalyzerOptions {
  promptPath?: string;
  model?: string;
  timeoutMs?: number;
  maxAttempts?: number;
}

export class ContentAnalyzer {
  private readonly prompt: string;
  private readonly options: ContentAnalyzerOptions;

  constructor(options: ContentAnalyzerOptions = {}) {
    this.options = options;
    this.prompt = loadPromptText(options.promptPath);
  }

  async analyzeArticle(input: AnalyzeArticleInput): Promise<ContentAnalysis> {
    const { articleId, ...request } = input;
    const { analysis } = await analyzeArticleWithCodexCli(request, this.prompt, {
      model: this.options.model,
      timeoutMs: this.options.timeoutMs,
      maxAttempts: this.options.maxAttempts,
    });
    return normalizeAnalysis(articleId, analysis);
  }
}

function loadPromptText(explicitPath?: string): string {
  const candidates = [
    explicitPath,
    process.env.OMC_ANALYZE_PROMPT_PATH,
    promptPathNearThisFile(),
    join(process.cwd(), 'src/analysis/prompts/analyze-article.md'),
  ]
    .filter(Boolean) as string[];
  for (const p of candidates) {
    if (existsSync(p)) return readFileSync(p, 'utf-8');
  }
  throw new Error('Could not locate analyze-article.md prompt (set OMC_ANALYZE_PROMPT_PATH)');
}

function promptPathNearThisFile(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, 'prompts', 'analyze-article.md');
}

function normalizeAnalysis(articleId: string, analysis: ContentAnalysis): ContentAnalysis {
  return {
    ...fillDefaults(analysis),
    articleId,
    analyzedAt: analysis.analyzedAt || new Date().toISOString(),
  };
}

function fillDefaults(analysis: ContentAnalysis): ContentAnalysis {
  return {
    ...analysis,
    topics: analysis.topics ?? [],
    topicScores: analysis.topicScores ?? {},
    keyPoints: analysis.keyPoints ?? [],
    contentType: analysis.contentType || 'N/A',
    problemStatement: analysis.problemStatement || 'N/A',
    audienceLevel: analysis.audienceLevel || 'N/A',
    technologiesMentioned: analysis.technologiesMentioned ?? [],
    companiesMentioned: analysis.companiesMentioned ?? [],
    peopleMentioned: analysis.peopleMentioned ?? [],
    conceptsExplained: analysis.conceptsExplained ?? [],
    relatedTechnologies: analysis.relatedTechnologies ?? [],
    useCases: analysis.useCases ?? [],
    targetKeywords: analysis.targetKeywords ?? [],
    searchQuestions: analysis.searchQuestions ?? [],
    githubRepo: analysis.githubRepo || 'N/A',
    releaseInfo: analysis.releaseInfo || 'N/A',
  };
}
