import { Flags } from '@oclif/core';
import { BaseCommand } from '@lib/cli/base-command.js';
import { formatSuccess, formatError } from '@lib/cli/formatters.js';
import { initDatabase } from '@storage/database.js';
import { testConnection } from '@lib/omnivore/client.js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { config } from 'dotenv';

/**
 * Interactive setup wizard for omnivore-content-system
 * AIDEV-NOTE: init-command - one-time setup for new installations
 */
export default class Init extends BaseCommand {
  static override description = 'Initialize omnivore-content-system setup';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --force',
    '<%= config.bin %> <%= command.id %> --api-key YOUR_KEY',
  ];

  static override flags = {
    force: Flags.boolean({
      description: 'Reinitialize existing setup',
      default: false,
    }),
    'api-key': Flags.string({
      description: 'Set OMNIVORE_API_KEY non-interactively',
    }),
  };

  protected async execute(flags: { force: boolean; 'api-key'?: string }): Promise<void> {
    this.log('Initializing omnivore-content-system...\n');

    await this.ensureDirectories();
    await this.initializeDatabase(flags.force);
    await this.setupEnvironment(flags['api-key']);
    await this.testApiConnection();

    this.log('\n' + formatSuccess('Setup complete! Run "omc --help" to get started.'));
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = ['data', 'content', 'temp', 'content/articles', 'content/analysis', 'content/generated'];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        this.log(formatSuccess(`Created directory: ${dir}`));
      }
    }
  }

  private async initializeDatabase(force: boolean): Promise<void> {
    try {
      initDatabase('data/omnivore-content.db');
      this.log(formatSuccess('Database initialized'));
    } catch (error) {
      if (force) {
        this.log(formatSuccess('Database reinitialized'));
      } else {
        throw error;
      }
    }
  }

  private async setupEnvironment(apiKey?: string): Promise<void> {
    this.createEnvFile();

    if (apiKey) {
      this.updateEnvFile('OMNIVORE_API_KEY', apiKey);
      this.log(formatSuccess('OMNIVORE_API_KEY set'));
    } else {
      this.checkApiKey();
    }
  }

  private createEnvFile(): void {
    if (!existsSync('.env') && existsSync('.env.example')) {
      const example = readFileSync('.env.example', 'utf-8');
      writeFileSync('.env', example);
      this.log(formatSuccess('Created .env from .env.example'));
    } else if (!existsSync('.env')) {
      this.log(formatError('.env.example not found'));
    }
  }

  private checkApiKey(): void {
    config();
    if (!process.env.OMNIVORE_API_KEY) {
      this.log(formatError('OMNIVORE_API_KEY not set in .env'));
      this.log('Please add your API key to .env file');
    }
  }

  private async testApiConnection(): Promise<void> {
    config();
    if (process.env.OMNIVORE_API_KEY) {
      const connected = await testConnection();
      if (!connected) {
        this.log(formatError('API connection test failed'));
      }
    }
  }

  private updateEnvFile(key: string, value: string): void {
    let envContent = existsSync('.env') ? readFileSync('.env', 'utf-8') : '';
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}\n`;
    }

    writeFileSync('.env', envContent);
  }
}
