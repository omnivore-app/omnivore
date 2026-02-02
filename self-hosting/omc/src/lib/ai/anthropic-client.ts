/**
 * Anthropic API Client
 * Wrapper for Claude API for content analysis
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import type { ContentAnalysis, AnalysisRequest } from '@omc-types/analysis.js';

// Load environment variables
config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 8000;

if (!API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not set in environment');
  process.exit(1);
}

// Initialize client
const client = new Anthropic({ apiKey: API_KEY });

/**
 * Token and cost tracking
 */
interface UsageMetrics {
  inputTokens: number;
  outputTokens: number;
  totalCost: number; // In USD
}

const COST_PER_INPUT_TOKEN = 0.000003;  // $3 per 1M tokens
const COST_PER_OUTPUT_TOKEN = 0.000015; // $15 per 1M tokens

/**
 * Calculate cost from token usage
 */
function calculateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * COST_PER_INPUT_TOKEN) + (outputTokens * COST_PER_OUTPUT_TOKEN);
}

/**
 * Sleep for exponential backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry logic with exponential backoff
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) break;

      const backoffMs = Math.pow(2, attempt) * 1000;
      console.error(`Attempt ${attempt} failed, retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }

  throw lastError!;
}

/**
 * Parse JSON response from Claude
 */
function parseAnalysisResponse(text: string): ContentAnalysis {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Build usage metrics from Anthropic response
 */
function buildUsageMetrics(usage: Anthropic.Usage): UsageMetrics {
  return {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    totalCost: calculateCost(usage.input_tokens, usage.output_tokens),
  };
}

/**
 * Analyze article content using Claude
 *
 * @param request Article data to analyze
 * @param systemPrompt System prompt for analysis
 * @returns Analysis result with usage metrics
 */
export async function analyzeArticle(
  request: AnalysisRequest,
  systemPrompt: string
): Promise<{ analysis: ContentAnalysis; usage: UsageMetrics }> {
  const userMessage = buildUserMessage(request);

  return withRetry(async () => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = extractTextContent(response);
    const analysis = parseAnalysisResponse(text);
    const usage = buildUsageMetrics(response.usage);

    return { analysis, usage };
  });
}

/**
 * Build user message from request data
 */
function buildUserMessage(request: AnalysisRequest): string {
  let message = `Title: ${request.title}\n`;
  message += `URL: ${request.url}\n`;
  if (request.author) message += `Author: ${request.author}\n`;
  if (request.publishedAt) message += `Published: ${request.publishedAt}\n`;
  message += `Word Count: ${request.wordCount}\n\n`;

  if (request.highlights.length > 0) {
    message += `User Highlights:\n`;
    request.highlights.forEach(h => {
      message += `- "${h.quote}"\n`;
      if (h.annotation) message += `  Note: ${h.annotation}\n`;
    });
    message += `\n`;
  }

  message += `Content:\n${request.content}`;
  return message;
}

/**
 * Extract text from Claude response content blocks
 */
function extractTextContent(response: Anthropic.Message): string {
  return response.content
    .filter(block => block.type === 'text')
    .map(block => (block as Anthropic.TextBlock).text)
    .join('');
}

/**
 * Test API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hello' }],
    });

    console.log('✅ Connected to Anthropic API');
    console.log(`   Model: ${MODEL}`);
    console.log(`   Response tokens: ${response.usage.output_tokens}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Anthropic API');
    console.error(`   ${(error as Error).message}`);
    return false;
  }
}

export { MODEL, MAX_TOKENS };
