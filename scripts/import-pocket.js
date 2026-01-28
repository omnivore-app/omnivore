#!/usr/bin/env node

import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
function getArgValue(argName) {
  const argIndex = process.argv.indexOf(argName);
  return argIndex !== -1 && argIndex + 1 < process.argv.length ? process.argv[argIndex + 1] : null;
}

// Configuration
const CONFIG = {
  API_URL:
    process.env.API_ENDPOINT ||
    process.env.API_URL ||
    'http://localhost:4000/api/graphql',
  API_KEY: process.env.OMNIVORE_API_KEY,
  CSV_PATH: getArgValue('--file') || join(dirname(__dirname), 'Downloads', 'part_000000.csv'),
  TRACKING_DB_PATH: join(__dirname, 'pocket-import-progress.sqlite'),
  BATCH_SIZE: 3, // Reduced to prevent server crashes
  RATE_LIMIT: 2, // concurrent requests
  MAX_PROCESSING_ITEMS: 3, // Never exceed this many items in PROCESSING state
  STATUS_CHECK_INTERVAL: 10000, // Check status every 10 seconds
  PROCESSING_TIMEOUT: 300000, // 5 minutes timeout for stuck items
  TEST_MODE: process.argv.includes('--test'),
  TEST_LIMIT: parseInt(getArgValue('--limit')) || 10, // items to process in test mode
  DRY_RUN: process.argv.includes('--dry-run'),
  COMPARE_MODE: process.argv.includes('--compare'),
  MISSING_ONLY: process.argv.includes('--missing-only'),
};

if (!CONFIG.API_KEY) {
  console.error(chalk.red('❌ OMNIVORE_API_KEY environment variable is required'));
  console.error(
    chalk.gray(
      'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/import-pocket.js --file ~/Downloads/part_000000.csv',
    ),
  );
  process.exit(1);
}

// Processing Queue Manager
class ProcessingQueue {
  constructor() {
    this.items = new Map(); // url -> {item, startTime, checkCount}
    this.maxSize = CONFIG.MAX_PROCESSING_ITEMS;
  }

  add(item, url) {
    if (this.items.size >= this.maxSize) {
      throw new Error(`Processing queue full (${this.maxSize} items)`);
    }
    this.items.set(url, {
      item,
      startTime: Date.now(),
      checkCount: 0
    });
  }

  remove(url) {
    return this.items.delete(url);
  }

  size() {
    return this.items.size;
  }

  isFull() {
    return this.items.size >= this.maxSize;
  }

  getTimeouts() {
    const now = Date.now();
    const timeouts = [];
    for (const [url, data] of this.items) {
      if (now - data.startTime > CONFIG.PROCESSING_TIMEOUT) {
        timeouts.push({ url, ...data });
      }
    }
    return timeouts;
  }

  getAll() {
    return Array.from(this.items.entries()).map(([url, data]) => ({ url, ...data }));
  }

  async waitForSlot(checkInterval = 2000) {
    while (this.isFull()) {
      console.log(chalk.yellow(`⏳ Processing queue full (${this.size()}/${this.maxSize}), waiting...`));
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
  }
}

class PocketImporter {
  constructor() {
    this.progressDb = null;
    this.stats = {
      totalItems: 0,
      processedItems: 0,
      successfulItems: 0,
      failedItems: [],
      skippedItems: 0,
      timeoutItems: 0,
      startTime: Date.now(),
    };
    this.limit = pLimit(CONFIG.RATE_LIMIT);
    this.processingQueue = new ProcessingQueue();
    this.statusMonitorActive = false;
  }

  // Convert Unix timestamp to ISO string
  convertPocketTimestamp(unixTimestamp) {
    if (!unixTimestamp) return new Date().toISOString();
    return new Date(parseInt(unixTimestamp) * 1000).toISOString();
  }

  // Process tags string into array
  processTags(tagString) {
    if (!tagString || tagString.trim() === '') return [];
    return tagString.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }

  // Map Pocket status to Omnivore folder
  mapStatus(status) {
    return status === 'archive' ? 'archive' : 'inbox';
  }

  // Initialize progress tracking database
  initProgressDb() {
    try {
      this.progressDb = new Database(CONFIG.TRACKING_DB_PATH);

      // Create table to track processed URLs
      this.progressDb.exec(`
        CREATE TABLE IF NOT EXISTS processed_urls (
          url TEXT PRIMARY KEY,
          pocket_title TEXT,
          success INTEGER,
          error_message TEXT,
          processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log(chalk.green('✓ Progress tracking database initialized'));
    } catch (error) {
      console.error(chalk.red('✗ Failed to initialize progress database:'), error.message);
      process.exit(1);
    }
  }

  // Check if URL was already processed
  isAlreadyProcessed(url) {
    const stmt = this.progressDb.prepare('SELECT success FROM processed_urls WHERE url = ?');
    const result = stmt.get(url);
    return result?.success === 1;
  }

  // Mark URL as processed
  markAsProcessed(url, title, success, errorMessage = null) {
    const stmt = this.progressDb.prepare(`
      INSERT OR REPLACE INTO processed_urls (url, pocket_title, success, error_message)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(url, title, success ? 1 : 0, errorMessage);
  }

  // Parse Pocket CSV export
  parsePocketExport() {
    try {
      console.log(chalk.blue(`📋 Reading Pocket export from: ${CONFIG.CSV_PATH}`));

      const csvContent = readFileSync(CONFIG.CSV_PATH, 'utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      this.stats.totalItems = records.length;
      console.log(chalk.green(`✓ Loaded ${records.length} items from Pocket export`));

      // Transform Pocket data to our format
      return records.map(record => ({
        url: record.url,
        title: record.title || 'Untitled',
        tags: this.processTags(record.tags),
        savedAt: this.convertPocketTimestamp(record.time_added),
        folder: this.mapStatus(record.status),
        source: 'pocket-import',
      }));
    } catch (error) {
      console.error(chalk.red('✗ Failed to parse Pocket export:'), error.message);
      process.exit(1);
    }
  }

  // Make GraphQL request to Omnivore API
	  async makeGraphQLRequest(query, variables = {}) {
	    const response = await fetch(CONFIG.API_URL, {
	      method: 'POST',
	      headers: {
	        'Content-Type': 'application/json',
	        'Omnivore-Authorization': CONFIG.API_KEY,
	      },
	      body: JSON.stringify({ query, variables }),
	    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Log the full response for debugging
    if (result.errors || !result.data) {
      console.log(chalk.yellow('GraphQL Response:'), JSON.stringify(result, null, 2));
    }

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  // Test authentication with the API key
  async testAuthentication() {
    try {
      const query = `
        query {
          me {
            id
            name
            email
          }
        }
      `;

      const data = await this.makeGraphQLRequest(query);
      if (data.me) {
        console.log(chalk.green(`✓ Authentication successful for user: ${data.me.name} (${data.me.email})`));
        return true;
      } else {
        console.log(chalk.red('✗ Authentication failed: No user returned'));
        return false;
      }
    } catch (error) {
      console.log(chalk.red('✗ Authentication failed:', error.message));
      return false;
    }
  }

  // Check status of a specific item by URL
  async checkItemStatus(url) {
    const query = `
      query SearchByUrl($query: String!) {
        search(first: 1, query: $query) {
          ... on SearchSuccess {
            edges {
              node {
                id
                title
                url
                state
                savedAt
                originalArticleUrl
              }
            }
          }
          ... on SearchError {
            errorCodes
          }
        }
      }
    `;

    try {
      // Search for exact URL match
      const searchQuery = `url:"${url}"`;
      const data = await this.makeGraphQLRequest(query, { query: searchQuery });

      if (data.search.errorCodes) {
        return { error: data.search.errorCodes.join(', ') };
      }

      if (data.search.edges && data.search.edges.length > 0) {
        const item = data.search.edges[0].node;
        return {
          found: true,
          state: item.state,
          id: item.id,
          title: item.title
        };
      }

      return { found: false };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Monitor processing items until they reach SUCCEEDED or timeout
  async startStatusMonitoring() {
    if (this.statusMonitorActive) return;
    this.statusMonitorActive = true;

    const monitorLoop = async () => {
      while (this.statusMonitorActive) {
        try {
          // Check for timeouts first
          const timeouts = this.processingQueue.getTimeouts();
          for (const timeout of timeouts) {
            console.log(chalk.red(`⏰ Timeout: ${timeout.item.title} (${((Date.now() - timeout.startTime) / 1000).toFixed(0)}s)`));
            this.processingQueue.remove(timeout.url);
            this.stats.timeoutItems++;
            this.markAsProcessed(timeout.url, timeout.item.title, false, 'Processing timeout');
          }

          // Check status of all processing items
          const processingItems = this.processingQueue.getAll();

          for (const processingItem of processingItems) {
            const { url, item } = processingItem;
            const statusResult = await this.checkItemStatus(url);

            processingItem.checkCount++;

            if (statusResult.found && statusResult.state === 'SUCCEEDED') {
              console.log(chalk.green(`✅ Completed: ${item.title} (${processingItem.checkCount} checks)`));
              this.processingQueue.remove(url);
              this.stats.successfulItems++;
              this.markAsProcessed(url, item.title, true);
            } else if (statusResult.found && statusResult.state === 'FAILED') {
              console.log(chalk.red(`❌ Failed processing: ${item.title}`));
              this.processingQueue.remove(url);
              this.stats.failedItems.push({ item, error: 'Processing failed in Omnivore' });
              this.markAsProcessed(url, item.title, false, 'Processing failed');
            } else if (statusResult.error) {
              console.log(chalk.yellow(`⚠ Status check error for ${item.title}: ${statusResult.error}`));
            }
            // If still PROCESSING, continue monitoring
          }

          // Show queue status periodically
          if (this.processingQueue.size() > 0) {
            console.log(chalk.cyan(`🔄 Queue: ${this.processingQueue.size()}/${CONFIG.MAX_PROCESSING_ITEMS} processing`));
          }

        } catch (error) {
          console.error(chalk.red('Status monitoring error:'), error.message);
        }

        await new Promise(resolve => setTimeout(resolve, CONFIG.STATUS_CHECK_INTERVAL));
      }
    };

    // Start monitoring in background
    monitorLoop().catch(error => {
      console.error(chalk.red('Status monitoring crashed:'), error.message);
      this.statusMonitorActive = false;
    });
  }

  // Stop status monitoring
  stopStatusMonitoring() {
    this.statusMonitorActive = false;
  }

  // Import a single item from Pocket with queue management
  async importItem(item) {
    if (this.isAlreadyProcessed(item.url)) {
      this.stats.skippedItems++;
      console.log(chalk.yellow(`⚠ Skipping already processed: ${item.title}`));
      return { skipped: true };
    }

    // Wait for queue slot if needed
    if (this.processingQueue.isFull()) {
      await this.processingQueue.waitForSlot();
    }

    const mutation = `
      mutation SaveUrl($input: SaveUrlInput!) {
        saveUrl(input: $input) {
          ... on SaveSuccess {
            url
            clientRequestId
          }
          ... on SaveError {
            errorCodes
          }
        }
      }
    `;

    try {
      // Convert tags to label inputs
      const labelInputs = item.tags.map(tag => ({ name: tag }));

      const input = {
        url: item.url,
        source: item.source,
        clientRequestId: randomUUID(),
        savedAt: item.savedAt,
        folder: item.folder,
      };

      // Only add labels if we have any
      if (labelInputs.length > 0) {
        input.labels = labelInputs;
      }

      if (CONFIG.DRY_RUN) {
        console.log(chalk.blue(`[DRY RUN] Would import: ${item.title}`));
        console.log(chalk.gray(`  URL: ${item.url}`));
        console.log(chalk.gray(`  Saved: ${item.savedAt}`));
        console.log(chalk.gray(`  Tags: ${item.tags.join(', ')}`));
        console.log(chalk.gray(`  Folder: ${item.folder}`));
        return { success: true, dryRun: true };
      }

      const data = await this.makeGraphQLRequest(mutation, { input });

      // Check if the response has the expected structure
      if (!data || !data.saveUrl) {
        console.error(chalk.red('Unexpected GraphQL response:'), JSON.stringify(data, null, 2));
        throw new Error('Invalid GraphQL response structure');
      }

      if (data.saveUrl.errorCodes) {
        throw new Error(`Failed to save item: ${data.saveUrl.errorCodes.join(', ')}`);
      }

      // Check if we got a successful response
      if (!data.saveUrl.url) {
        console.error(chalk.red('GraphQL saveUrl response:'), JSON.stringify(data.saveUrl, null, 2));
        throw new Error('No URL returned from saveUrl mutation');
      }

      // Add to processing queue for monitoring (don't mark as processed yet)
      try {
        this.processingQueue.add(item, item.url);
        console.log(chalk.blue(`📥 Queued for processing: ${item.title} [Queue: ${this.processingQueue.size()}/${CONFIG.MAX_PROCESSING_ITEMS}]`));
      } catch (queueError) {
        console.error(chalk.red('Failed to add to processing queue:'), queueError.message);
        // Fallback: mark as successful immediately
        this.markAsProcessed(item.url, item.title, true);
        this.stats.successfulItems++;
      }

      return { success: true, url: data.saveUrl.url, queued: true };

    } catch (error) {
      console.error(chalk.red(`✗ Failed to import "${item.title}":`, error.message));
      this.markAsProcessed(item.url, item.title, false, error.message);
      this.stats.failedItems.push({ item, error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Import items in batches with monitoring
  async importItems(items) {
    const totalItems = (CONFIG.TEST_MODE || CONFIG.DRY_RUN) ? Math.min(items.length, CONFIG.TEST_LIMIT) : items.length;
    const itemsToProcess = items.slice(0, totalItems);

    console.log(chalk.blue(`\n📚 Importing ${totalItems} items from Pocket with queue monitoring...`));
    console.log(chalk.gray(`Max concurrent processing: ${CONFIG.MAX_PROCESSING_ITEMS}`));
    console.log(chalk.gray(`Processing timeout: ${CONFIG.PROCESSING_TIMEOUT / 1000}s`));

    if (CONFIG.DRY_RUN) {
      console.log(chalk.yellow('🏃 Running in DRY RUN mode - no items will be actually imported'));
      return; // Skip monitoring for dry run
    }

    // Start status monitoring
    await this.startStatusMonitoring();

    const batches = [];
    for (let i = 0; i < itemsToProcess.length; i += CONFIG.BATCH_SIZE) {
      batches.push(itemsToProcess.slice(i, i + CONFIG.BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(chalk.blue(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} items)`));

      // Process batch with concurrency limit
      const promises = batch.map(item =>
        this.limit(async () => {
          const result = await this.importItem(item);
          this.stats.processedItems++;

          const progress = ((this.stats.processedItems / totalItems) * 100).toFixed(1);

          if (result.skipped) {
            console.log(chalk.yellow(`[${progress}%] ⚠ Skipped: ${item.title}`));
          } else if (result.success) {
            if (result.dryRun) {
              console.log(chalk.green(`[${progress}%] ✓ Would import: ${item.title}`));
            } else if (result.queued) {
              console.log(chalk.blue(`[${progress}%] 📤 Submitted: ${item.title}`));
            } else {
              console.log(chalk.green(`[${progress}%] ✓ Imported: ${item.title}`));
            }
          } else {
            console.log(chalk.red(`[${progress}%] ✗ Failed: ${item.title}`));
          }

          return result;
        })
      );

      await Promise.all(promises);

      // Show current queue status
      console.log(chalk.cyan(`Batch ${batchIndex + 1} complete. Processing queue: ${this.processingQueue.size()}/${CONFIG.MAX_PROCESSING_ITEMS}`));

      // Small delay between batches to be respectful
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Wait for all processing items to complete
    console.log(chalk.blue('\n⏳ Waiting for all items to finish processing...'));
    while (this.processingQueue.size() > 0) {
      console.log(chalk.yellow(`Waiting for ${this.processingQueue.size()} items to complete processing...`));
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Stop monitoring
    this.stopStatusMonitoring();
    console.log(chalk.green('✅ All items processed!'));
  }

  // Generate and save import report
  async generateReport() {
    const duration = ((Date.now() - this.stats.startTime) / 1000).toFixed(2);
    const successRate = ((this.stats.successfulItems / (this.stats.processedItems - this.stats.skippedItems)) * 100).toFixed(1);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      totalItems: this.stats.totalItems,
      processedItems: this.stats.processedItems,
      successfulItems: this.stats.successfulItems,
      skippedItems: this.stats.skippedItems,
      failedItems: this.stats.failedItems.length,
      timeoutItems: this.stats.timeoutItems,
      successRate: `${successRate}%`,
      errors: this.stats.failedItems,
      queueConfig: {
        maxProcessingItems: CONFIG.MAX_PROCESSING_ITEMS,
        processingTimeout: `${CONFIG.PROCESSING_TIMEOUT / 1000}s`,
        statusCheckInterval: `${CONFIG.STATUS_CHECK_INTERVAL / 1000}s`,
      },
      config: {
        testMode: CONFIG.TEST_MODE,
        dryRun: CONFIG.DRY_RUN,
        batchSize: CONFIG.BATCH_SIZE,
        rateLimit: CONFIG.RATE_LIMIT,
      },
    };

    await writeFile(
      join(__dirname, `pocket-import-report-${Date.now()}.json`),
      JSON.stringify(report, null, 2)
    );

    console.log(chalk.blue('\n📊 Import Summary:'));
    console.log(chalk.green(`✓ Successfully imported: ${this.stats.successfulItems}`));
    console.log(chalk.yellow(`⚠ Skipped (already processed): ${this.stats.skippedItems}`));
    console.log(chalk.red(`✗ Failed: ${this.stats.failedItems.length}`));
    console.log(chalk.magenta(`⏰ Timed out: ${this.stats.timeoutItems}`));
    console.log(chalk.blue(`📈 Success rate: ${successRate}%`));
    console.log(chalk.blue(`⏱ Duration: ${duration}s`));
    console.log(chalk.gray(`🔧 Queue management: Max ${CONFIG.MAX_PROCESSING_ITEMS} concurrent, ${CONFIG.PROCESSING_TIMEOUT / 1000}s timeout`));

    if (this.stats.failedItems.length > 0) {
      console.log(chalk.red('\n❌ Failed items:'));
      this.stats.failedItems.forEach(failure => {
        console.log(chalk.red(`   • ${failure.item.title}: ${failure.error}`));
      });
    }
  }

  // Check status of imported items via API
  async checkImportedItemsStatus() {
    console.log(chalk.blue('\n🔍 Checking status of imported items...'));

    const query = `
      query Search($after: String, $first: Int, $query: String) {
        search(after: $after, first: $first, query: $query) {
          ... on SearchSuccess {
            edges {
              node {
                id
                title
                url
                state
                savedAt
                readingProgressPercent
                labels {
                  name
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          ... on SearchError {
            errorCodes
          }
        }
      }
    `;

    try {
      // Get items imported from pocket (using source identifier)
      const data = await this.makeGraphQLRequest(query, {
        first: 100,
        query: 'source:pocket-import'
      });

      // Check if we got an error response
      if (data.search.errorCodes) {
        console.error(chalk.red('✗ Search API error:'), data.search.errorCodes.join(', '));
        return [];
      }

      // Access edges from the SearchSuccess type
      if (data.search.edges && data.search.edges.length > 0) {
        console.log(chalk.green(`✓ Found ${data.search.edges.length} imported items via API`));

        const statusCounts = {};
        data.search.edges.forEach(edge => {
          const state = edge.node.state;
          statusCounts[state] = (statusCounts[state] || 0) + 1;
        });

        console.log(chalk.blue('📊 Status breakdown via API:'));
        Object.entries(statusCounts).forEach(([state, count]) => {
          console.log(chalk.gray(`   ${state}: ${count}`));
        });

        return data.search.edges.map(edge => edge.node);
      } else {
        console.log(chalk.yellow('⚠ No items found via API search'));
        return [];
      }
    } catch (error) {
      console.error(chalk.red('✗ Failed to check status via API:'), error.message);
      return [];
    }
  }

  // Check status via direct database query using Docker
  async checkImportedItemsStatusViaDb() {
    console.log(chalk.blue('\n🗄️ Checking status via database...'));

    try {
      // Query the database directly via Docker
      const { execSync } = await import('child_process');

      // Get list of successfully processed URLs from local tracking database
      const successfulUrls = this.progressDb.prepare('SELECT url FROM processed_urls WHERE success = 1').all();

      if (successfulUrls.length === 0) {
        console.log(chalk.yellow('⚠ No successfully processed URLs found in tracking database'));
        return null;
      }

      const urlList = successfulUrls.map(row => `'${row.url.replace(/'/g, "''")}'`).join(',');

      const dbQuery = `
        SELECT
          li.id,
          li.title,
          li.original_url as url,
          li.state,
          li.saved_at,
          li.reading_progress_top_percent,
          li.folder,
          array_agg(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL) as labels
        FROM omnivore.library_item li
        LEFT JOIN omnivore.entity_labels el ON li.id = el.library_item_id
        LEFT JOIN omnivore.labels l ON el.label_id = l.id
        WHERE li.original_url IN (${urlList})
        GROUP BY li.id, li.title, li.original_url, li.state, li.saved_at, li.reading_progress_top_percent, li.folder
        ORDER BY li.saved_at DESC
        LIMIT 100;
      `;

      const dockerCommand = `docker exec omnivore-postgres psql -U postgres -d omnivore -c "${dbQuery.replace(/"/g, '\\"')}" -t -A -F','`;

      console.log(chalk.gray('Executing database query via Docker...'));
      const result = execSync(dockerCommand, { encoding: 'utf-8' });

      if (result.trim()) {
        const lines = result.trim().split('\n').filter(line => line.trim());
        console.log(chalk.green(`✓ Found ${lines.length} imported items in database`));

        const statusCounts = {};
        const folderCounts = {};

        lines.forEach(line => {
          const [id, title, url, state, savedAt, progress, folder, labels] = line.split(',');
          statusCounts[state] = (statusCounts[state] || 0) + 1;
          folderCounts[folder] = (folderCounts[folder] || 0) + 1;
        });

        console.log(chalk.blue('📊 Status breakdown via database:'));
        Object.entries(statusCounts).forEach(([state, count]) => {
          console.log(chalk.gray(`   ${state}: ${count}`));
        });

        console.log(chalk.blue('📁 Folder breakdown:'));
        Object.entries(folderCounts).forEach(([folder, count]) => {
          console.log(chalk.gray(`   ${folder}: ${count}`));
        });

        return lines;
      } else {
        console.log(chalk.yellow('⚠ No items found in database'));
        return [];
      }
    } catch (error) {
      console.error(chalk.red('✗ Failed to check database status:'), error.message);
      console.log(chalk.yellow('💡 Make sure Docker is running and omnivore-postgres container is accessible'));
      return [];
    }
  }

  // Get detailed import statistics
  async getImportStatistics() {
    console.log(chalk.blue('\n📈 Getting detailed import statistics...'));

    try {
      const { execSync } = await import('child_process');

      // Get statistics from our progress database
      const progressStats = this.progressDb.prepare(`
        SELECT
          success,
          COUNT(*) as count
        FROM processed_urls
        GROUP BY success
      `).all();

      console.log(chalk.blue('📊 Progress tracking statistics:'));
      progressStats.forEach(stat => {
        const status = stat.success ? 'Successful' : 'Failed';
        console.log(chalk.gray(`   ${status}: ${stat.count}`));
      });

      // Get recent failures
      const recentFailures = this.progressDb.prepare(`
        SELECT url, pocket_title, error_message, processed_at
        FROM processed_urls
        WHERE success = 0
        ORDER BY processed_at DESC
        LIMIT 10
      `).all();

      if (recentFailures.length > 0) {
        console.log(chalk.red('\n❌ Recent failures:'));
        recentFailures.forEach(failure => {
          console.log(chalk.red(`   • ${failure.pocket_title}: ${failure.error_message}`));
        });
      }

      // Get successful URLs from tracking database
      const successfulUrls = this.progressDb.prepare('SELECT url FROM processed_urls WHERE success = 1').all();

      // Check if imported items match expected dates (only if we have successful URLs)
      if (successfulUrls.length > 0) {
        const urlList = successfulUrls.map(row => `'${row.url.replace(/'/g, "''")}'`).join(',');
        const dateQuery = `
          SELECT
            DATE(li.saved_at) as saved_date,
            COUNT(*) as count
          FROM omnivore.library_item li
          WHERE li.original_url IN (${urlList})
          GROUP BY DATE(li.saved_at)
          ORDER BY saved_date DESC
          LIMIT 10;
        `;

      try {
        const dockerCommand = `docker exec omnivore-postgres psql -U postgres -d omnivore -c "${dateQuery.replace(/"/g, '\\"')}" -t -A -F','`;
        const dateResult = execSync(dockerCommand, { encoding: 'utf-8' });

        if (dateResult.trim()) {
          console.log(chalk.blue('\n📅 Import dates distribution:'));
          const dateLines = dateResult.trim().split('\n').filter(line => line.trim());
          dateLines.forEach(line => {
            const [date, count] = line.split(',');
            console.log(chalk.gray(`   ${date}: ${count} items`));
          });
        }
      } catch (dbError) {
        console.log(chalk.yellow('⚠ Could not fetch date distribution from database'));
      }
      } else {
        console.log(chalk.yellow('⚠ Could not fetch date distribution from database'));
      }

    } catch (error) {
      console.error(chalk.red('✗ Failed to get statistics:'), error.message);
    }
  }

  // Load CSV items (wrapper around parsePocketExport for comparison)
  loadCSVItems() {
    try {
      console.log(chalk.blue(`📋 Reading CSV file for comparison: ${CONFIG.CSV_PATH}`));

      const csvContent = readFileSync(CONFIG.CSV_PATH, 'utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      console.log(chalk.green(`✅ Loaded ${records.length} items from CSV`));

      // Transform CSV data for comparison (simpler format than import)
      return records.map(record => ({
        url: record.url || record.resolved_url || record.given_url || '',
        title: record.title || 'No Title',
        givenUrl: record.given_url || '',
        resolvedUrl: record.resolved_url || '',
        timeAdded: record.time_added ? new Date(parseInt(record.time_added) * 1000).toISOString() : null,
        tags: record.tags || '',
      }));
    } catch (error) {
      console.error(chalk.red('✗ Failed to load CSV file:'), error.message);
      throw error;
    }
  }

  // Compare CSV URLs with Omnivore URLs
  async compareUrls() {
    console.log(chalk.blue('🔍 Starting URL comparison between CSV and Omnivore...'));

    // Initialize database and load CSV data
    this.initProgressDb();
    const csvItems = this.loadCSVItems();

    // Populate database with CSV data if needed
    const csvInsertStmt = this.progressDb.prepare(`
      INSERT OR REPLACE INTO processed_urls (url, pocket_title, success, processed_at)
      VALUES (?, ?, 0, datetime('now'))
    `);

    for (const item of csvItems) {
      csvInsertStmt.run(item.url, item.title);
    }

    console.log(chalk.green(`✅ Loaded ${csvItems.length} URLs from CSV into database`));

    // Fetch all URLs from Omnivore using GraphQL
    console.log(chalk.blue('🌐 Fetching all URLs from Omnivore...'));
    const omnivoreUrls = await this.fetchAllOmnivoreUrls();

    // Compare URLs
    const comparison = this.performComparison(csvItems, omnivoreUrls);

    // Generate comparison report
    await this.generateComparisonReport(comparison);

    return comparison;
  }

  // Fetch all URLs from Omnivore with pagination
  async fetchAllOmnivoreUrls() {
    const allUrls = [];
    let hasNextPage = true;
    let after = null;
    let pageCount = 0;

    const query = `
      query FetchUrls($after: String, $first: Int) {
        search(
          query: "in:all sort:saved-desc"
          after: $after
          first: $first
        ) {
          ... on SearchSuccess {
            pageInfo {
              totalCount
              hasNextPage
              endCursor
            }
            edges {
              cursor
              node {
                id
                title
                url
                originalArticleUrl
                createdAt
                updatedAt
              }
            }
          }
          ... on SearchError {
            errorCodes
          }
        }
      }
    `;

    while (hasNextPage) {
      pageCount++;
      console.log(chalk.gray(`   Fetching page ${pageCount}...`));

      try {
	        const response = await fetch(CONFIG.API_URL, {
	          method: 'POST',
	          headers: {
	            'Content-Type': 'application/json',
	            'Omnivore-Authorization': CONFIG.API_KEY,
	          },
	          body: JSON.stringify({
	            query,
	            variables: { after, first: 100 },
	          }),
	        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        }

        const searchResult = result.data.search;
        if (searchResult.errorCodes) {
          throw new Error(`Search error: ${searchResult.errorCodes.join(', ')}`);
        }

        const items = searchResult.edges || [];
        console.log(chalk.gray(`   Found ${items.length} items on page ${pageCount}`));

        for (const edge of items) {
          const item = edge.node;
          allUrls.push({
            id: item.id,
            title: item.title,
            url: item.url,
            originalUrl: item.originalArticleUrl || item.url,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          });
        }

        hasNextPage = searchResult.pageInfo.hasNextPage;
        after = searchResult.pageInfo.endCursor;

        if (pageCount === 1) {
          console.log(chalk.blue(`📊 Total items in Omnivore: ${searchResult.pageInfo.totalCount}`));
        }

        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(chalk.red(`❌ Error fetching page ${pageCount}:`), error.message);
        throw error;
      }
    }

    console.log(chalk.green(`✅ Fetched ${allUrls.length} URLs from Omnivore`));
    return allUrls;
  }

  // Normalize URL for comparison
  normalizeUrl(url) {
    if (!url) return '';
    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .replace(/#.*$/, '');
  }

  // Perform URL comparison
  performComparison(csvItems, omnivoreUrls) {
    console.log(chalk.blue('🔍 Performing URL comparison...'));

    // Create normalized lookup maps
    const omnivoreMap = new Map();
    const csvMap = new Map();

    // Build Omnivore lookup
    for (const item of omnivoreUrls) {
      const normalizedUrl = this.normalizeUrl(item.url);
      const normalizedOriginal = this.normalizeUrl(item.originalUrl);

      if (normalizedUrl) omnivoreMap.set(normalizedUrl, item);
      if (normalizedOriginal && normalizedOriginal !== normalizedUrl) {
        omnivoreMap.set(normalizedOriginal, item);
      }
    }

    // Build CSV lookup
    for (const item of csvItems) {
      const normalized = this.normalizeUrl(item.url);
      if (normalized) csvMap.set(normalized, item);
    }

    // Find matches and differences
    const inBoth = [];
    const onlyInOmnivore = [];
    const onlyInCSV = [];

    // Check Omnivore items
    for (const [normalizedUrl, omnivoreItem] of omnivoreMap) {
      if (csvMap.has(normalizedUrl)) {
        inBoth.push({
          url: normalizedUrl,
          omnivore: omnivoreItem,
          csv: csvMap.get(normalizedUrl),
        });
      } else {
        onlyInOmnivore.push(omnivoreItem);
      }
    }

    // Check CSV items not in Omnivore
    for (const [normalizedUrl, csvItem] of csvMap) {
      if (!omnivoreMap.has(normalizedUrl)) {
        onlyInCSV.push(csvItem);
      }
    }

    return {
      inBoth,
      onlyInOmnivore,
      onlyInCSV,
      stats: {
        omnivoreTotal: omnivoreUrls.length,
        csvTotal: csvItems.length,
        matches: inBoth.length,
        omnivoreOnly: onlyInOmnivore.length,
        csvOnly: onlyInCSV.length,
      },
    };
  }

  // Generate comparison report
  async generateComparisonReport(comparison) {
    const { inBoth, onlyInOmnivore, onlyInCSV, stats } = comparison;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log(chalk.blue('\n📊 COMPARISON REPORT'));
    console.log(chalk.blue('=================='));
    console.log(chalk.cyan(`📚 Total in Omnivore: ${stats.omnivoreTotal}`));
    console.log(chalk.cyan(`📋 Total in CSV: ${stats.csvTotal}`));
    console.log(chalk.green(`✅ URLs in both: ${stats.matches}`));
    console.log(chalk.blue(`🔵 Only in Omnivore: ${stats.omnivoreOnly}`));
    console.log(chalk.red(`🔴 Missing from Omnivore: ${stats.csvOnly}`));
    console.log(chalk.yellow(`📈 Import success rate: ${((stats.matches / stats.csvTotal) * 100).toFixed(1)}%`));

    // Update database with comparison results
    const updateStmt = this.progressDb.prepare(`
      UPDATE processed_urls
      SET status = 'FOUND_IN_OMNIVORE', success = 1
      WHERE url = ?
    `);

    for (const match of inBoth) {
      const csvItem = match.csv;
      updateStmt.run(csvItem.url);
    }

    // Save missing URLs
    if (onlyInCSV.length > 0) {
      const missingFile = join(__dirname, `missing-from-omnivore-${timestamp}.json`);
      await writeFile(missingFile, JSON.stringify(onlyInCSV, null, 2));
      console.log(chalk.yellow(`\n💾 Saved ${onlyInCSV.length} missing URLs to: ${missingFile}`));

      // Save simple list
      const missingList = join(__dirname, `missing-urls-list-${timestamp}.txt`);
      const missingUrlsList = onlyInCSV.map(item => item.url).join('\n');
      await writeFile(missingList, missingUrlsList);
      console.log(chalk.yellow(`💾 Saved missing URLs list to: ${missingList}`));
    }

    // Save full report
    const reportFile = join(__dirname, `url-comparison-report-${timestamp}.json`);
    await writeFile(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      summary: {
        importSuccessRate: `${((stats.matches / stats.csvTotal) * 100).toFixed(1)}%`,
        urlsInBoth: stats.matches,
        urlsMissingFromOmnivore: stats.csvOnly,
        urlsOnlyInOmnivore: stats.omnivoreOnly,
      },
      missingUrls: onlyInCSV.slice(0, 100), // First 100 missing
    }, null, 2));

    console.log(chalk.green(`💾 Saved full comparison report to: ${reportFile}`));
  }

  // Filter items to only those missing from Omnivore
  async filterMissingItems(items) {
    console.log(chalk.blue('🔍 Filtering to only URLs missing from Omnivore...'));

    // Load comparison data from previous run (requires running --compare first)
    const omnivoreUrls = await this.fetchAllOmnivoreUrls();

    // Create normalized lookup map for Omnivore URLs
    const omnivoreNormalized = new Set();

    for (const item of omnivoreUrls) {
      const normalized = this.normalizeUrl(item.url);
      const originalNormalized = this.normalizeUrl(item.originalUrl);

      if (normalized) omnivoreNormalized.add(normalized);
      if (originalNormalized && originalNormalized !== normalized) {
        omnivoreNormalized.add(originalNormalized);
      }
    }

    // Filter items to only missing ones
    const missingItems = items.filter(item => {
      const normalized = this.normalizeUrl(item.url);
      return normalized && !omnivoreNormalized.has(normalized);
    });

    console.log(chalk.green(`✅ Found ${missingItems.length} URLs missing from Omnivore (out of ${items.length} total)`));
    return missingItems;
  }

  // Normalize URL for comparison (from comparison logic)
  normalizeUrl(url) {
    if (!url) return '';

    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '') // Remove www
      .replace(/\/$/, '') // Remove trailing slash
      .replace(/#.*$/, '') // Remove fragments
      .replace(/\?.*$/, ''); // Remove query parameters
  }

  // Main execution flow
  async run() {
    console.log(chalk.blue('🚀 Starting Pocket import to Omnivore...\n'));

    // Check if this is a comparison only
    if (CONFIG.COMPARE_MODE) {
      console.log(chalk.blue('🔍 Comparison mode: Comparing CSV URLs with Omnivore URLs...\n'));
      await this.compareUrls();
      return;
    }

    // Check if this is missing-only mode
    if (CONFIG.MISSING_ONLY) {
      console.log(chalk.blue('🔍 Missing-only mode: Importing only URLs missing from Omnivore...\n'));
    }

    // Check if this is a status check only
    if (process.argv.includes('--status-only')) {
      this.initProgressDb();
      await this.checkImportedItemsStatus();
      await this.checkImportedItemsStatusViaDb();
      await this.getImportStatistics();

      if (this.progressDb) {
        this.progressDb.close();
      }
      return;
    }

    // Test authentication
    const authSuccess = await this.testAuthentication();
    if (!authSuccess) {
      console.log(chalk.red('✗ Authentication failed. Please check your OMNIVORE_API_KEY environment variable.'));
      process.exit(1);
    }

    // Initialize progress tracking
    this.initProgressDb();

    // Parse Pocket export
    let items = this.parsePocketExport();

    // Filter to missing-only if requested
    if (CONFIG.MISSING_ONLY) {
      items = await this.filterMissingItems(items);
    }

    // Import items
    await this.importItems(items);

    // Generate report
    await this.generateReport();

    // Check status of imported items
    await this.checkImportedItemsStatus();
    await this.checkImportedItemsStatusViaDb();
    await this.getImportStatistics();

    // Cleanup
    if (this.progressDb) {
      this.progressDb.close();
    }

    console.log(chalk.green('\n🎉 Pocket import completed!'));
  }
}

// Show help message
function showHelp() {
  console.log(chalk.blue('📚 Pocket Import to Omnivore\n'));
  console.log('Usage:');
  console.log('  node import-pocket.js [options]\n');
  console.log('Options:');
  console.log('  --help           Show this help message');
  console.log('  --test           Import only first 10 items for testing');
  console.log('  --dry-run        Show what would be imported without actually importing');
  console.log('  --status-only    Check status of previously imported items only');
  console.log('  --compare        Compare CSV URLs with URLs in Omnivore (no import)');
  console.log('  --file <path>    Path to Pocket CSV export file');
  console.log('  --limit <num>    Number of items to process (default: 10 in test mode)');
  console.log('\nEnvironment Variables:');
  console.log('  OMNIVORE_API_KEY Required API key for Omnivore instance\n');
  console.log('Examples:');
  console.log('  node import-pocket.js --test --dry-run --limit 3');
  console.log('  node import-pocket.js --file ~/Downloads/pocket_export.csv');
  console.log('  node import-pocket.js --status-only');
  console.log('  node import-pocket.js --compare');
  console.log('  node import-pocket.js');
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  showHelp();
  process.exit(0);
}

// Run the importer
const importer = new PocketImporter();
importer.run().catch(error => {
  console.error(chalk.red('💥 Import failed:'), error.message);
  process.exit(1);
});
