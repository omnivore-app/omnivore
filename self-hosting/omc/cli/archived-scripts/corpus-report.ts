#!/usr/bin/env tsx

/**
 * Generate corpus analysis report
 * AIDEV-NOTE: tracking-db - reads from SQLite analysis_queue table
 */

import Database from 'better-sqlite3';

console.log('\n' + '═'.repeat(80));
console.log('CORPUS ANALYSIS REPORT');
console.log('═'.repeat(80));

// AIDEV-NOTE: tracking-db - read from SQLite, not deprecated batch file
const db = new Database('data/omnivore-content.db', { readonly: true });

// Queue status from tracking DB
const statusCounts = db.prepare(`
  SELECT status, COUNT(*) as count
  FROM analysis_queue
  GROUP BY status
`).all() as { status: string; count: number }[];

const total = statusCounts.reduce((sum, row) => sum + row.count, 0);

console.log(`\n📊 Queue Status:`);
console.log(`   Total articles: ${total}`);
for (const { status, count } of statusCounts) {
  console.log(`   ${status}: ${count}`);
}

// Load completed analyses from SQLite
const rows = db.prepare(`
  SELECT article_id, article_title, analysis_json
  FROM analysis_queue
  WHERE status = 'completed' AND analysis_json IS NOT NULL
`).all() as { article_id: string; article_title: string; analysis_json: string }[];

console.log(`\n📚 Analyzed Articles: ${rows.length}\n`);

// Parse analysis JSON from each row
const analyses = rows.map(row => ({
  articleId: row.article_id,
  articleTitle: row.article_title,
  ...JSON.parse(row.analysis_json)
})).filter(a => a.topics && a.topics[0] !== 'N/A'); // Filter out failed analyses

// Topic distribution
const topicCounts: Record<string, number> = {};
const topicScoreTotals: Record<string, number> = {};

for (const analysis of analyses) {
  for (const topic of analysis.topics) {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    const score = analysis.topicScores[topic] || 0;
    topicScoreTotals[topic] = (topicScoreTotals[topic] || 0) + score;
  }
}

console.log('═'.repeat(80));
console.log('TOPIC DISTRIBUTION');
console.log('═'.repeat(80));

const sortedTopics = Object.entries(topicCounts)
  .sort((a, b) => b[1] - a[1]);

console.log(`\n📈 Topics by frequency:\n`);
for (const [topic, count] of sortedTopics) {
  const avgScore = (topicScoreTotals[topic] / count).toFixed(2);
  console.log(`   ${topic.padEnd(30)} ${count} articles (avg score: ${avgScore})`);
}

// Sentiment distribution
const sentiments: Record<string, number> = {};
for (const analysis of analyses) {
  const sentiment = analysis.sentiment;
  sentiments[sentiment] = (sentiments[sentiment] || 0) + 1;
}

console.log(`\n😊 Sentiment distribution:\n`);
for (const [sentiment, count] of Object.entries(sentiments)) {
  console.log(`   ${sentiment}: ${count}`);
}

// Identify clusters (articles with shared topics)
console.log('\n' + '═'.repeat(80));
console.log('TOPIC CLUSTERS (Content Opportunities)');
console.log('═'.repeat(80));

for (const [topic, count] of sortedTopics) {
  if (count < 2) continue; // Only show topics with 2+ articles

  console.log(`\n📂 ${topic} (${count} articles):`);

  const articlesWithTopic = analyses.filter(a =>
    a.topics.includes(topic)
  );

  for (const analysis of articlesWithTopic) {
    const score = analysis.topicScores[topic].toFixed(2);
    console.log(`   [${score}] ${analysis.articleTitle.substring(0, 70)}`);
  }

  // Content opportunity
  if (count >= 3) {
    console.log(`   💡 OPPORTUNITY: Weekly roundup or comparison post possible`);
  } else if (count === 2) {
    console.log(`   💡 OPPORTUNITY: Comparison or "X vs Y" post possible`);
  }
}

// Monetization angles summary
console.log('\n' + '═'.repeat(80));
console.log('MONETIZATION ANGLES');
console.log('═'.repeat(80) + '\n');

for (const analysis of analyses) {
  console.log(`📝 ${analysis.articleTitle.substring(0, 70)}`);
  console.log(`   ${analysis.monetizationAngle}\n`);
}

console.log('═'.repeat(80));
console.log('END OF REPORT');
console.log('═'.repeat(80) + '\n');

// AIDEV-NOTE: tracking-db - close connection after report
db.close();
