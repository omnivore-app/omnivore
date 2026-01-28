#!/usr/bin/env node

import Database from 'better-sqlite3';
import fetch from 'node-fetch';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  API_URL:
    process.env.API_ENDPOINT ||
    process.env.API_URL ||
    'http://localhost:4000/api/graphql',
  API_KEY: process.env.OMNIVORE_API_KEY,
  MAPPING_DB_PATH:
    process.env.MAPPING_DB_PATH || join(__dirname, 'url-id-mapping.sqlite'),
  BATCH_SIZE: 100, // GraphQL allows up to 100 items per request
};

if (!CONFIG.API_KEY) {
  console.error(chalk.red('❌ OMNIVORE_API_KEY environment variable is required'));
  console.error(
    chalk.gray(
      'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/download-items-mapping.js',
    ),
  );
  process.exit(1);
}

class ItemsDownloader {
  constructor() {
    this.db = null;
    this.stats = {
      totalItems: 0,
      downloadedItems: 0,
      startTime: Date.now(),
    };
  }

  // Initialize mapping database
  initMappingDatabase() {
    try {
      this.db = new Database(CONFIG.MAPPING_DB_PATH);
      console.log(chalk.green('✓ Created mapping database'));

      // Create mapping table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS item_mapping (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_url ON item_mapping(url);
      `);

      // Clear existing data for fresh download
      this.db.exec('DELETE FROM item_mapping');
      console.log(chalk.blue('✓ Initialized item_mapping table'));
    } catch (error) {
      console.error(chalk.red('✗ Failed to initialize database:'), error.message);
      process.exit(1);
    }
  }

  // Make GraphQL request
  async makeGraphQLRequest(query, variables = {}) {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Omnivore-Authorization': CONFIG.API_KEY,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  // Download all items with pagination
  async downloadAllItems() {
    const query = `
      query GetItems($after: String, $first: Int) {
        search(query: "", after: $after, first: $first) {
          ... on SearchSuccess {
            edges {
              cursor
              node {
                id
                url
                title
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

    let hasNextPage = true;
    let cursor = null;
    let pageCount = 0;

    while (hasNextPage) {
      try {
        const data = await this.makeGraphQLRequest(query, {
          after: cursor,
          first: CONFIG.BATCH_SIZE,
        });

        if (data.search.errorCodes) {
          throw new Error(`Search failed: ${data.search.errorCodes.join(', ')}`);
        }

        const { edges, pageInfo } = data.search;

        // Insert items into database
        const insertStmt = this.db.prepare(
          'INSERT OR REPLACE INTO item_mapping (id, url, title) VALUES (?, ?, ?)'
        );

        const insertMany = this.db.transaction((items) => {
          for (const item of items) {
            insertStmt.run(item.node.id, item.node.url, item.node.title);
          }
        });

        insertMany(edges);

        this.stats.downloadedItems += edges.length;
        pageCount++;

        console.log(chalk.green(
          `✓ Downloaded page ${pageCount}: ${edges.length} items (Total: ${this.stats.downloadedItems})`
        ));

        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;

        // Small delay to avoid rate limiting
        if (hasNextPage) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(chalk.red(`✗ Error downloading page ${pageCount + 1}:`), error.message);
        throw error;
      }
    }
  }

  // Generate report
  async generateReport() {
    const duration = (Date.now() - this.stats.startTime) / 1000;

    // Get stats from database
    const totalCount = this.db.prepare('SELECT COUNT(*) as count FROM item_mapping').get().count;
    const sampleItems = this.db.prepare('SELECT * FROM item_mapping LIMIT 5').all();

    console.log(chalk.blue(`\n📊 Download Report:`));
    console.log(chalk.green(`✓ Total items downloaded: ${totalCount}`));
    console.log(chalk.gray(`⏱️  Duration: ${duration.toFixed(2)} seconds`));
    console.log(chalk.blue(`\n📄 Sample items:`));

    sampleItems.forEach((item, index) => {
      console.log(chalk.gray(`${index + 1}. ${item.title || 'No title'}`));
      console.log(chalk.gray(`   ID: ${item.id}`));
      console.log(chalk.gray(`   URL: ${item.url}\n`));
    });

    console.log(chalk.green(`✓ Mapping database saved to: ${CONFIG.MAPPING_DB_PATH}`));
  }

  // Main process
  async download() {
    try {
      console.log(chalk.bold.blue('📥 Starting Items Download Process'));
      console.log(chalk.gray(`API: ${CONFIG.API_URL}`));

      this.initMappingDatabase();

      console.log(chalk.blue('\n📤 Downloading all items from Omnivore...'));
      await this.downloadAllItems();

      await this.generateReport();

      console.log(chalk.bold.green('\n🎉 Download completed successfully!'));

    } catch (error) {
      console.error(chalk.red('\n💥 Download failed:'), error.message);
      process.exit(1);
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }
}

// Run the download
const downloader = new ItemsDownloader();
downloader.download();
