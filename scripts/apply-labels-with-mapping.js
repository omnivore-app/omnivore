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
  MAPPING_DB_PATH:
    process.env.MAPPING_DB_PATH || join(__dirname, 'url-id-mapping.sqlite'),
  RATE_LIMIT: 3, // concurrent requests
  BATCH_SIZE: 10, // items to process per batch
};

if (!CONFIG.API_KEY) {
  console.error(chalk.red('❌ OMNIVORE_API_KEY environment variable is required'));
  console.error(
    chalk.gray(
      'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/apply-labels-with-mapping.js',
    ),
  );
  process.exit(1);
}

class LabelApplicator {
  constructor() {
    this.archiveDb = null;
    this.mappingDb = null;
    this.stats = {
      totalItemsWithLabels: 0,
      processedItems: 0,
      failedItems: [],
      successfulItems: 0,
      notFoundItems: [],
      startTime: Date.now(),
    };
    this.limit = pLimit(CONFIG.RATE_LIMIT);
    this.labelNameToId = new Map();
    this.urlToPageId = new Map();
  }

  // Initialize databases
  initDatabases() {
    try {
      // Archive database
      this.archiveDb = new Database(CONFIG.ARCHIVE_DB_PATH, { readonly: true });
      console.log(chalk.green('✓ Connected to archive SQLite database'));

      // Mapping database
      this.mappingDb = new Database(CONFIG.MAPPING_DB_PATH, { readonly: true });
      console.log(chalk.green('✓ Connected to mapping database'));

      // Load all URL to ID mappings into memory for fast lookup
      const mappings = this.mappingDb.prepare('SELECT url, id FROM item_mapping').all();
      mappings.forEach(row => {
        this.urlToPageId.set(row.url, row.id);
      });
      console.log(chalk.green(`✓ Loaded ${mappings.length} URL-to-ID mappings`));

    } catch (error) {
      console.error(chalk.red('✗ Failed to connect to databases:'), error.message);
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

  // Extract items with their labels from archive SQLite
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

    const results = this.archiveDb.prepare(query).all();
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

  // Apply labels to an item using setLabels mutation
  async applyLabelsToItem(pageId, labelNames, itemTitle = '', itemUrl = '') {
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
      console.error(chalk.red(`✗ Failed to apply labels to "${itemTitle}" (${itemUrl}):`), error.message);
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
            // Look up the page ID from our mapping
            const pageId = this.urlToPageId.get(item.url);

            if (!pageId) {
              throw new Error(`Item not found in mapping for URL: ${item.url}`);
            }

            // Apply labels
            const appliedLabels = await this.applyLabelsToItem(
              pageId,
              item.labels,
              item.title,
              item.url
            );

            this.stats.successfulItems++;
            console.log(chalk.green(`✓ Applied ${appliedLabels.length} labels to: ${item.title || item.url}`));
            console.log(chalk.gray(`  Labels: ${appliedLabels.map(l => l.name).join(', ')}`));

            return { success: true, item, appliedLabels, pageId };
          } catch (error) {
            if (error.message.includes('not found in mapping')) {
              this.stats.notFoundItems.push({ item, error: error.message });
              console.error(chalk.yellow(`⚠ Item not found in Omnivore: ${item.title || item.url}`));
            } else {
              this.stats.failedItems.push({ item, error: error.message });
              console.error(chalk.red(`✗ Failed to process "${item.title}": ${error.message}`));
            }
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
        notFoundItems: this.stats.notFoundItems.length,
        failedItems: this.stats.failedItems.length,
      },
      notFoundItems: this.stats.notFoundItems.map(f => ({
        title: f.item.title,
        url: f.item.url,
        labels: f.item.labels,
      })),
      failures: this.stats.failedItems,
    };

    const reportPath = join(__dirname, 'label-application-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.blue(`\n📊 Label Application Report:`));
    console.log(chalk.green(`✓ Successfully labeled: ${report.summary.successfulItems}/${report.summary.totalItemsWithLabels} items`));

    if (report.summary.notFoundItems > 0) {
      console.log(chalk.yellow(`⚠ Not found in Omnivore: ${report.summary.notFoundItems} items`));
    }

    if (report.summary.failedItems > 0) {
      console.log(chalk.red(`✗ Failed items: ${report.summary.failedItems}`));
    }

    console.log(chalk.blue(`📄 Full report saved to: ${reportPath}`));
    return report;
  }

  // Main process
  async applyLabels() {
    try {
      console.log(chalk.bold.blue('🏷️  Starting Label Application Process (with Mapping)'));
      console.log(chalk.gray(`API: ${CONFIG.API_URL}`));

      this.initDatabases();

      // Extract original label associations
      console.log(chalk.blue('\n📤 Extracting label associations from archive SQLite...'));
      const itemsWithLabels = this.extractItemLabelAssociations();
      console.log(chalk.green(`✓ Found ${itemsWithLabels.length} items with labels`));

      if (itemsWithLabels.length === 0) {
        console.log(chalk.yellow('No items with labels found. Nothing to do.'));
        return;
      }

      // Show sample of items to be processed
      console.log(chalk.blue('\n📋 Sample items to process:'));
      itemsWithLabels.slice(0, 3).forEach((item, index) => {
        console.log(chalk.gray(`${index + 1}. ${item.title || 'No title'}`));
        console.log(chalk.gray(`   URL: ${item.url}`));
        console.log(chalk.gray(`   Labels: ${item.labels.join(', ')}`));
      });

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
      if (this.archiveDb) {
        this.archiveDb.close();
      }
      if (this.mappingDb) {
        this.mappingDb.close();
      }
    }
  }
}

// Run the label application
const applicator = new LabelApplicator();
applicator.applyLabels();
