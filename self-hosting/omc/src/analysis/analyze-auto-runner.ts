import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import type { AnalysisJob, AnalysisQueueRepository } from '@storage/AnalysisQueueRepository.js';
import type { ContentAnalyzer, AnalyzeArticleInput } from '@analysis/ContentAnalyzer.js';
import type { AnalysisWriter } from '@storage/AnalysisWriter.js';
import type { ContentAnalysis } from '@omc-types/analysis.js';
import type { OmnivoreArticle } from '@omc-types/omnivore.js';
import { getArticle } from '@lib/omnivore/client.js';
import type { AnalysisJsonlRecord } from '@storage/AnalysisWriter.js';

export interface AnalyzeAutoRunnerDeps {
  jobs: AnalysisJob[];
  username: string;
  analyzer: ContentAnalyzer;
  writer: AnalysisWriter;
  repo: AnalysisQueueRepository;
  keepTemp: boolean;
  jsonlPath?: string;
}

export interface AnalyzeAutoRunnerResult {
  saved: number;
  failed: number;
  skipped: number;
}

export async function runAnalyzeAuto(deps: AnalyzeAutoRunnerDeps): Promise<AnalyzeAutoRunnerResult> {
  ensureTempDir();
  const totals = { saved: 0, failed: 0, skipped: 0 };
  for (const job of deps.jobs) {
    const outcome = await runOne(job, deps);
    totals[outcome]++;
  }
  return totals;
}

async function runOne(job: AnalysisJob, deps: AnalyzeAutoRunnerDeps): Promise<'saved' | 'failed' | 'skipped'> {
  const article = await fetchArticle(job.articleSlug, deps.username);
  if (!article) return markFailure(deps.repo, job.articleId, 'Failed to fetch article from Omnivore');
  if (!article.content) return markFailure(deps.repo, job.articleId, 'Omnivore returned no content for article');

  const input = buildAnalyzeInput(job.articleId, article);
  const analysis = await deps.analyzer.analyzeArticle(input);
  const tempPath = writeTempRecord(job, article, deps.username, analysis);
  return await saveAndMarkComplete(job, article, analysis, tempPath, deps);
}

async function fetchArticle(slug: string, username: string): Promise<OmnivoreArticle | null> {
  try {
    const result = await getArticle(slug, username);
    if (result.errorCodes?.length) return null;
    return result.article ?? null;
  } catch {
    return null;
  }
}

function buildAnalyzeInput(articleId: string, article: OmnivoreArticle): AnalyzeArticleInput {
  const content = String(article.content ?? '');
  return {
    articleId,
    title: article.title,
    author: article.author ?? undefined,
    url: article.url,
    content,
    wordCount: estimateWordCount(content),
    highlights: (article.highlights ?? []).map((h) => ({
      quote: h.quote,
      annotation: h.annotation ?? undefined,
    })),
    publishedAt: article.publishedAt ?? undefined,
  };
}

function writeTempRecord(job: AnalysisJob, article: OmnivoreArticle, username: string, analysis: ContentAnalysis): string {
  const path = join('temp', `${job.articleSlug}.jsonl`);
  const record = {
    articleId: job.articleId,
    articleSlug: job.articleSlug,
    username,
    articleUrl: article.url,
    articleTitle: article.title,
    savedAt: article.savedAt,
    publishedAt: article.publishedAt ?? null,
    updatedAt: article.updatedAt ?? null,
    analysis,
  };
  writeFileSync(path, JSON.stringify(record) + '\n', 'utf-8');
  return path;
}

async function saveAndMarkComplete(
  job: AnalysisJob,
  article: OmnivoreArticle,
  analysis: ContentAnalysis,
  tempPath: string,
  deps: AnalyzeAutoRunnerDeps
): Promise<'saved' | 'failed'> {
  try {
    const mdPath = await deps.writer.write(job.articleId, article.url, article.title, article.savedAt, analysis, job.articleSlug);
    deps.repo.storeAnalysis(job.articleId, article.publishedAt ?? null, article.updatedAt ?? null, JSON.stringify(analysis), mdPath);
    if (deps.jsonlPath) {
      await deps.writer.appendToJsonl(deps.jsonlPath, buildJsonlRecord(job, article, analysis, mdPath));
    }
    if (!deps.keepTemp) unlinkSync(tempPath);
    return 'saved';
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    deps.repo.markFailed(job.articleId, `Save failed: ${message}`);
    return 'failed';
  }
}

function buildJsonlRecord(job: AnalysisJob, article: OmnivoreArticle, analysis: ContentAnalysis, markdownPath: string): AnalysisJsonlRecord {
  return {
    articleId: job.articleId,
    articleSlug: job.articleSlug,
    articleUrl: article.url,
    articleTitle: article.title,
    savedAt: article.savedAt,
    publishedAt: article.publishedAt ?? null,
    updatedAt: article.updatedAt ?? null,
    markdownPath,
    analyzedAt: analysis.analyzedAt,
    topics: analysis.topics,
    topicScores: analysis.topicScores,
    sentiment: analysis.sentiment,
    summary: analysis.summary,
    keyPoints: analysis.keyPoints,
    monetizationAngle: analysis.monetizationAngle,
    contentType: analysis.contentType,
    problemStatement: analysis.problemStatement,
    audienceLevel: analysis.audienceLevel,
    technologiesMentioned: analysis.technologiesMentioned,
    companiesMentioned: analysis.companiesMentioned,
    peopleMentioned: analysis.peopleMentioned,
    conceptsExplained: analysis.conceptsExplained,
    relatedTechnologies: analysis.relatedTechnologies,
    useCases: analysis.useCases,
    targetKeywords: analysis.targetKeywords,
    searchQuestions: analysis.searchQuestions,
    githubRepo: analysis.githubRepo,
    releaseInfo: analysis.releaseInfo,
  };
}

function markFailure(repo: AnalysisQueueRepository, articleId: string, message: string): 'failed' {
  repo.markFailed(articleId, message);
  return 'failed';
}

function ensureTempDir(): void {
  if (!existsSync('temp')) mkdirSync('temp', { recursive: true });
}

function estimateWordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
