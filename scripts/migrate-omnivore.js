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
  DB_PATH: join(__dirname, '../self-hosting/archive-db/store.sqlite'),
  BATCH_SIZE: 50,
  RATE_LIMIT: 5, // concurrent requests
  TEST_MODE: process.argv.includes('--test'),
  TEST_LIMIT: 10, // items to process in test mode
};

if (!CONFIG.API_KEY) {
  console.error('❌ OMNIVORE_API_KEY environment variable is required');
  console.error(
    'Example: direnv exec . env OMNIVORE_API_KEY=... node scripts/migrate-omnivore.js'
  );
  process.exit(1);
}

// Core Data timestamp offset (seconds between 1970-01-01 and 2001-01-01)
const CORE_DATA_EPOCH_OFFSET = 978307200;

class OmnivoreMigrator {
  constructor() {
    this.db = null;
    this.stats = {
      totalItems: 0,
      totalLabels: 0,
      processedItems: 0,
      processedLabels: 0,
      failedItems: [],
      failedLabels: [],
      startTime: Date.now(),
    };
    this.limit = pLimit(CONFIG.RATE_LIMIT);
  }

  // Convert Core Data timestamp to ISO string
  convertTimestamp(coreDataTimestamp) {
    if (!coreDataTimestamp) return null;
    const unixTimestamp = coreDataTimestamp + CORE_DATA_EPOCH_OFFSET;
    return new Date(unixTimestamp * 1000).toISOString();
  }

  // Initialize database connection
  initDatabase() {
    try {
      this.db = new Database(CONFIG.DB_PATH, { readonly: true });
      console.log(chalk.green('✓ Connected to SQLite database'));
    } catch (error) {
      console.error(chalk.red('✗ Failed to connect to database:'), error.message);
      process.exit(1);
    }
  }

  // Extract labels from SQLite
  extractLabels() {
    const query = `
      SELECT
        ZID as id,
        ZNAME as name,
        ZCOLOR as color,
        ZLABELDESCRIPTION as description,
        ZCREATEDAT as createdAt
      FROM ZLINKEDITEMLABEL
      ORDER BY ZNAME
    `;

    const labels = this.db.prepare(query).all();
    this.stats.totalLabels = labels.length;

    return labels.map(label => ({
      id: label.id,
      name: label.name,
      color: label.color || '#3B82F6', // default blue if no color
      description: label.description || '',
      createdAt: this.convertTimestamp(label.createdAt),
    }));
  }

  // Extract items with their labels from SQLite
  extractItems() {
    // Check if we should only get missing items
    const onlyMissing = process.argv.includes('--missing-only');
    // Check if we should get specific missing labeled items
    const missingLabeled = process.argv.includes('--missing-labeled');

    const itemsQuery = missingLabeled ? `
      SELECT
        li.ZID as id,
        li.ZPAGEURLSTRING as url,
        li.ZTITLE as title,
        li.ZDESCRIPTIONTEXT as description,
        li.ZAUTHOR as author,
        li.ZSITENAME as siteName,
        li.ZCREATEDAT as createdAt,
        li.ZSAVEDAT as savedAt,
        li.ZUPDATEDAT as updatedAt,
        li.ZPUBLISHDATE as publishedAt,
        li.ZISARCHIVED as isArchived,
        li.ZREADAT as readAt
      FROM ZLINKEDITEM li
      WHERE li.ZPAGEURLSTRING IN (
        'https://github.com/danswer-ai/danswer',
        'https://segment.com/blog/rebuilding-our-infrastructure/',
        'https://www.hyperledger.org'
      )
      ORDER BY li.ZCREATEDAT
    ` : onlyMissing ? `
      SELECT
        li.ZID as id,
        li.ZPAGEURLSTRING as url,
        li.ZTITLE as title,
        li.ZDESCRIPTIONTEXT as description,
        li.ZAUTHOR as author,
        li.ZSITENAME as siteName,
        li.ZCREATEDAT as createdAt,
        li.ZSAVEDAT as savedAt,
        li.ZUPDATEDAT as updatedAt,
        li.ZPUBLISHDATE as publishedAt,
        li.ZISARCHIVED as isArchived,
        li.ZREADAT as readAt
      FROM ZLINKEDITEM li
      LEFT JOIN omnivore_mapping om ON li.ZPAGEURLSTRING = om.url
      WHERE om.url IS NULL AND li.ZPAGEURLSTRING = 'https://svgl.vercel.app'
      ORDER BY li.ZCREATEDAT
      LIMIT 1
    ` : `
      SELECT
        li.ZID as id,
        li.ZPAGEURLSTRING as url,
        li.ZTITLE as title,
        li.ZDESCRIPTIONTEXT as description,
        li.ZAUTHOR as author,
        li.ZSITENAME as siteName,
        li.ZCREATEDAT as createdAt,
        li.ZSAVEDAT as savedAt,
        li.ZUPDATEDAT as updatedAt,
        li.ZPUBLISHDATE as publishedAt,
        li.ZISARCHIVED as isArchived,
        li.ZREADAT as readAt
      FROM ZLINKEDITEM li
      ORDER BY li.ZCREATEDAT
      LIMIT 3
    `;

    const items = this.db.prepare(itemsQuery).all();
    this.stats.totalItems = items.length;

    // Get labels for each item
    const labelsQuery = `
      SELECT l.ZNAME as labelName
      FROM Z_2LABELS rel
      JOIN ZLINKEDITEMLABEL l ON rel.Z_3LABELS1 = l.Z_PK
      WHERE rel.Z_2LINKEDITEMS = ?
    `;
    const getLabels = this.db.prepare(labelsQuery);

    return items.map(item => {
      const labels = getLabels.all(item.id).map(l => l.labelName);

      return {
        id: item.id,
        url: item.url,
        title: item.title || '',
        description: item.description || '',
        author: item.author || '',
        siteName: item.siteName || '',
        labels: labels,
        createdAt: this.convertTimestamp(item.createdAt),
        savedAt: this.convertTimestamp(item.savedAt),
        updatedAt: this.convertTimestamp(item.updatedAt),
        publishedAt: this.convertTimestamp(item.publishedAt),
        isArchived: Boolean(item.isArchived),
        readAt: this.convertTimestamp(item.readAt),
      };
    });
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

  // Create a label in the new instance
  async createLabel(label) {
    const mutation = `
      mutation CreateLabel($input: CreateLabelInput!) {
        createLabel(input: $input) {
          ... on CreateLabelSuccess {
            label {
              id
              name
              color
            }
          }
          ... on CreateLabelError {
            errorCodes
          }
        }
      }
    `;

    try {
      const data = await this.makeGraphQLRequest(mutation, {
        input: {
          name: label.name,
          color: label.color,
          description: label.description,
        },
      });

      if (data.createLabel.errorCodes) {
        throw new Error(`Failed to create label: ${data.createLabel.errorCodes.join(', ')}`);
      }

      return data.createLabel.label;
    } catch (error) {
      console.error(chalk.red(`✗ Failed to create label "${label.name}":`, error.message));
      this.stats.failedLabels.push({ label, error: error.message });
      return null;
    }
  }

  // Save an item to the new instance
  async saveItem(item) {
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
      const labelInputs = item.labels.map(labelName => ({ name: labelName }));

      const data = await this.makeGraphQLRequest(mutation, {
        input: {
          url: item.url,
          source: 'migration',
          clientRequestId: item.id,
          labels: labelInputs.length > 0 ? labelInputs : undefined,
          savedAt: item.savedAt,
          publishedAt: item.publishedAt,
        },
      });

      if (data.saveUrl.errorCodes) {
        throw new Error(`Failed to save item: ${data.saveUrl.errorCodes.join(', ')}`);
      }

      return data.saveUrl;
    } catch (error) {
      console.error(chalk.red(`✗ Failed to save item "${item.title}":`, error.message));
      this.stats.failedItems.push({ item, error: error.message });
      return null;
    }
  }

  // Migrate labels
  async migrateLabels(labels) {
    console.log(chalk.blue(`\n📋 Migrating ${labels.length} labels...`));

    for (const label of labels) {
      await this.limit(async () => {
        const result = await this.createLabel(label);
        if (result) {
          this.stats.processedLabels++;
          console.log(chalk.green(`✓ Created label: ${label.name}`));
        }
      });
    }
  }

  // Migrate items in batches
  async migrateItems(items) {
    const totalItems = CONFIG.TEST_MODE ? Math.min(items.length, CONFIG.TEST_LIMIT) : items.length;
    const itemsToProcess = items.slice(0, totalItems);

    console.log(chalk.blue(`\n📚 Migrating ${totalItems} items...`));

    const batches = [];
    for (let i = 0; i < itemsToProcess.length; i += CONFIG.BATCH_SIZE) {
      batches.push(itemsToProcess.slice(i, i + CONFIG.BATCH_SIZE));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(chalk.cyan(`\nProcessing batch ${batchIndex + 1}/${batches.length} (${batch.length} items)...`));

      const promises = batch.map(item =>
        this.limit(async () => {
          const result = await this.saveItem(item);
          if (result) {
            this.stats.processedItems++;
            console.log(chalk.green(`✓ Saved: ${item.title || item.url}`));
          }
          return result;
        })
      );

      await Promise.all(promises);

      // Progress update
      const progress = ((batchIndex + 1) / batches.length * 100).toFixed(1);
      console.log(chalk.yellow(`Progress: ${progress}% (${this.stats.processedItems}/${totalItems} items)`));
    }
  }

  // Generate migration report
  async generateReport() {
    const duration = (Date.now() - this.stats.startTime) / 1000;

    const report = {
      migration: {
        timestamp: new Date().toISOString(),
        duration: `${duration.toFixed(2)} seconds`,
        testMode: CONFIG.TEST_MODE,
      },
      summary: {
        totalLabels: this.stats.totalLabels,
        processedLabels: this.stats.processedLabels,
        failedLabels: this.stats.failedLabels.length,
        totalItems: CONFIG.TEST_MODE ? Math.min(this.stats.totalItems, CONFIG.TEST_LIMIT) : this.stats.totalItems,
        processedItems: this.stats.processedItems,
        failedItems: this.stats.failedItems.length,
      },
      failures: {
        labels: this.stats.failedLabels,
        items: this.stats.failedItems,
      },
    };

    const reportPath = join(__dirname, 'migration-report.json');
    await writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(chalk.blue(`\n📊 Migration Report:`));
    console.log(chalk.green(`✓ Labels: ${report.summary.processedLabels}/${report.summary.totalLabels}`));
    console.log(chalk.green(`✓ Items: ${report.summary.processedItems}/${report.summary.totalItems}`));

    if (report.summary.failedLabels > 0) {
      console.log(chalk.red(`✗ Failed labels: ${report.summary.failedLabels}`));
    }
    if (report.summary.failedItems > 0) {
      console.log(chalk.red(`✗ Failed items: ${report.summary.failedItems}`));
    }

    console.log(chalk.blue(`📄 Full report saved to: ${reportPath}`));
    return report;
  }

  // Main migration process
  async migrate() {
    try {
      console.log(chalk.bold.blue('🚀 Starting Omnivore Migration'));
      console.log(chalk.gray(`Mode: ${CONFIG.TEST_MODE ? 'TEST' : 'FULL'}`));
      console.log(chalk.gray(`API: ${CONFIG.API_URL}`));

      this.initDatabase();

      // Test authentication first
      console.log(chalk.blue('\n🔑 Testing API authentication...'));
      const authResult = await this.testAuthentication();
      if (!authResult) {
        console.log(chalk.red('Migration aborted due to authentication failure.'));
        return;
      }

      // Extract data
      console.log(chalk.blue('\n📤 Extracting data from SQLite database...'));
      const labels = this.extractLabels();
      const items = this.extractItems();

      console.log(chalk.green(`✓ Extracted ${labels.length} labels and ${items.length} items`));

      // Migrate labels first
      if (labels.length > 0) {
        await this.migrateLabels(labels);
      }

      // Migrate items
      if (items.length > 0) {
        await this.migrateItems(items);
      }

      // Generate report
      await this.generateReport();

      console.log(chalk.bold.green('\n🎉 Migration completed!'));

    } catch (error) {
      console.error(chalk.red('\n💥 Migration failed:'), error.message);
      process.exit(1);
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }
}

// Run migration
const migrator = new OmnivoreMigrator();
migrator.migrate();
