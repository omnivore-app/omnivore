#!/usr/bin/env node

import Database from 'better-sqlite3';
import fetch from 'node-fetch';
import pLimit from 'p-limit';
import chalk from 'chalk';
import { writeFile } from 'fs/promises';
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
  ARCHIVE_DB_PATH:
    process.env.ARCHIVE_DB_PATH ||
    join(__dirname, '../self-hosting/archive-db/store.sqlite'),
  RATE_LIMIT: 3, // concurrent requests
  BATCH_SIZE: 10, // items to process per batch
};

if (!CONFIG.API_KEY) {
  console.error(chalk.red('❌ OMNIVORE_API_KEY environment variable is required'));
  console.error(
    chalk.gray(
      'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/apply-labels.js',
    ),
  );
  process.exit(1);
}

class LabelApplicator {
  constructor() {
    this.db = null;
    this.stats = {
      totalItemsWithLabels: 0,
      processedItems: 0,
      failedItems: [],
      successfulItems: 0,
      startTime: Date.now(),
    };
    this.limit = pLimit(CONFIG.RATE_LIMIT);
    this.labelNameToId = new Map();
    this.urlToPageId = new Map();
  }

  // Initialize database connection
  initDatabase() {
    try {
      this.db = new Database(CONFIG.ARCHIVE_DB_PATH, { readonly: true });
      console.log(chalk.green('✓ Connected to SQLite database'));
    } catch (error) {
      console.error(chalk.red('✗ Failed to connect to database:'), error.message);
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

  // Extract items with their labels from SQLite
  extractItemLabelAssociations() {
    const query = `
      SELECT
        li.ZPAGEURLSTRING as url,
        li.ZTITLE as title,
        GROUP_CONCAT(label.ZNAME, '||') as labelNames
      FROM ZLINKEDITEM li
      JOIN Z_2LABELS l ON li.Z_PK = l.Z_2LINKEDITEMS
      JOIN ZLINKEDITEMLABEL label ON l.Z_3LABELS1 = label.Z_PK
      GROUP BY li.ZPAGEURLSTRING, li.ZTITLE
      ORDER BY li.ZPAGEURLSTRING
    `;

    const results = this.db.prepare(query).all();
    this.stats.totalItemsWithLabels = results.length;

    return results.map(row => ({
      url: row.url,
      title: row.title || '',
      labels: row.labelNames.split('||').filter(name => name && name.trim()),
    }));
  }

  // Get all labels from the new Omnivore instance
  async fetchLabelsFromOmnivore() {
    const query = `
      query {
        labels {
          ... on LabelsSuccess {
            labels {
              id
              name
              color
            }
          }
          ... on LabelsError {
            errorCodes
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(query);

      if (data.labels.errorCodes) {
        throw new Error(`Failed to fetch labels: ${data.labels.errorCodes.join(', ')}`);
      }

      // Build mapping of label name to ID
      data.labels.labels.forEach(label => {
        this.labelNameToId.set(label.name, label.id);
      });

      console.log(chalk.green(`✓ Fetched ${data.labels.labels.length} labels from Omnivore`));
      return data.labels.labels;
    } catch (error) {
      console.error(chalk.red('✗ Failed to fetch labels:'), error.message);
      throw error;
    }
  }

  // Search for an item by URL in the new Omnivore instance
  async findItemByUrl(url) {
    const query = `
      query SearchByUrl($query: String!) {
        search(query: $query, first: 1) {
          ... on SearchSuccess {
            edges {
              node {
                id
                url
                title
                labels {
                  id
                  name
                }
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
      // Create a search query that should match the exact URL
      const searchQuery = `url:"${url}"`;

      const data = await this.makeGraphQLRequest(query, { query: searchQuery });

      if (data.search.errorCodes) {
        throw new Error(`Search failed: ${data.search.errorCodes.join(', ')}`);
      }

      const edges = data.search.edges || [];
      if (edges.length === 0) {
        return null;
      }

      const item = edges[0].node;

      // Verify URL match (sometimes search might return similar URLs)
      if (item.url === url) {
        return {
          id: item.id,
          url: item.url,
          title: item.title,
          currentLabels: item.labels || [],
        };
      }

      return null;
    } catch (error) {
      console.error(chalk.yellow(`⚠ Failed to search for URL ${url}:`, error.message));
      return null;
    }
  }

  // Apply labels to an item using setLabels mutation
  async applyLabelsToItem(pageId, labelNames, itemTitle = '') {
    // Convert label names to IDs
    const labelIds = labelNames
      .map(name => this.labelNameToId.get(name))
      .filter(id => id); // Remove any undefined IDs

    if (labelIds.length === 0) {
      throw new Error(`No valid labels found for item. Requested: ${labelNames.join(', ')}`);
    }

    const mutation = `
      mutation SetLabels($input: SetLabelsInput!) {
        setLabels(input: $input) {
          ... on SetLabelsSuccess {
            labels {
              id
              name
            }
          }
          ... on SetLabelsError {
            errorCodes
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(mutation, {
        input: {
          pageId: pageId,
          labelIds: labelIds,
        },
      });

      if (data.setLabels.errorCodes) {
        throw new Error(`Failed to set labels: ${data.setLabels.errorCodes.join(', ')}`);
      }

      return data.setLabels.labels;
    } catch (error) {
      console.error(chalk.red(`✗ Failed to apply labels to "${itemTitle}":`, error.message));
      throw error;
    }
  }

  // Process items in batches
  async processItems(itemsWithLabels) {
    console.log(chalk.blue(`\n🏷️  Processing ${itemsWithLabels.length} items with labels...`));

    const batches = [];
    for (let i = 0; i < itemsWithLabels.length; i += CONFIG.BATCH_SIZE) {
      batches.push(itemsWithLabels.slice(i, i + CONFIG.BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(chalk.cyan(`\nProcessing batch ${batchIndex + 1}/${batches.length} (${batch.length} items)...`));

      const promises = batch.map(item =>
        this.limit(async () => {
          try {
            // Find the item in the new system
            const foundItem = await this.findItemByUrl(item.url);

            if (!foundItem) {
              throw new Error(`Item not found in Omnivore for URL: ${item.url}`);
            }

            // Apply labels
            const appliedLabels = await this.applyLabelsToItem(
              foundItem.id,
              item.labels,
              item.title
            );

            this.stats.successfulItems++;
            console.log(chalk.green(`✓ Applied ${appliedLabels.length} labels to: ${item.title || foundItem.title}`));

            return { success: true, item, appliedLabels };
          } catch (error) {
            this.stats.failedItems.push({ item, error: error.message });
            console.error(chalk.red(`✗ Failed to process "${item.title}": ${error.message}`));
            return { success: false, item, error: error.message };
          }
        })
      );

      await Promise.all(promises);

      // Progress update
      this.stats.processedItems += batch.length;
      const progress = (this.stats.processedItems / this.stats.totalItemsWithLabels * 100).toFixed(1);
      console.log(chalk.yellow(`Progress: ${progress}% (${this.stats.processedItems}/${this.stats.totalItemsWithLabels} items)`));
    }
  }

  // Generate report
  async generateReport() {
    const duration = (Date.now() - this.stats.startTime) / 1000;

    const report = {
      labelApplication: {
        timestamp: new Date().toISOString(),
        duration: `${duration.toFixed(2)} seconds`,
      },
      summary: {
        totalItemsWithLabels: this.stats.totalItemsWithLabels,
        processedItems: this.stats.processedItems,
        successfulItems: this.stats.successfulItems,
        failedItems: this.stats.failedItems.length,
      },
      failures: this.stats.failedItems,
    };

    const reportPath = join(__dirname, 'label-application-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.blue(`\n📊 Label Application Report:`));
    console.log(chalk.green(`✓ Successfully labeled: ${report.summary.successfulItems}/${report.summary.totalItemsWithLabels} items`));

    if (report.summary.failedItems > 0) {
      console.log(chalk.red(`✗ Failed items: ${report.summary.failedItems}`));
    }

    console.log(chalk.blue(`📄 Full report saved to: ${reportPath}`));
    return report;
  }

  // Main process
  async applyLabels() {
    try {
      console.log(chalk.bold.blue('🏷️  Starting Label Application Process'));
      console.log(chalk.gray(`API: ${CONFIG.API_URL}`));

      this.initDatabase();

      // Extract original label associations
      console.log(chalk.blue('\n📤 Extracting label associations from SQLite...'));
      const itemsWithLabels = this.extractItemLabelAssociations();
      console.log(chalk.green(`✓ Found ${itemsWithLabels.length} items with labels`));

      if (itemsWithLabels.length === 0) {
        console.log(chalk.yellow('No items with labels found. Nothing to do.'));
        return;
      }

      // Fetch current labels from Omnivore
      console.log(chalk.blue('\n📋 Fetching current labels from Omnivore...'));
      await this.fetchLabelsFromOmnivore();

      // Process items
      await this.processItems(itemsWithLabels);

      // Generate report
      await this.generateReport();

      console.log(chalk.bold.green('\n🎉 Label application completed!'));

    } catch (error) {
      console.error(chalk.red('\n💥 Label application failed:'), error.message);
      process.exit(1);
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }
}

// Run the label application
const applicator = new LabelApplicator();
applicator.applyLabels();
