import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatHeader, formatSuccess, formatError } from '@lib/cli/formatters.js';
import { loadEnvFile } from '@lib/cli/command-utils.js';
import { join } from 'path';

/**
 * Validate all configuration values.
 * AIDEV-NOTE: Checks required keys exist and validates formats
 */
export default class ConfigValidate extends BaseCommand {
  static override description = 'Validate all configuration values';

  static override examples = [
    '$ omc config validate',
    '$ omc config validate --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: any): Promise<void> {
    const issues = this.validateConfig();

    if (flags.json) {
      this.log(JSON.stringify({ valid: issues.length === 0, issues }, null, 2));
    } else {
      this.displayValidation(issues);
    }

    if (issues.length > 0) {
      throw new Error('Configuration validation failed');
    }
  }

  private validateConfig(): string[] {
    const issues: string[] = [];
    const envPath = join(process.cwd(), '.env');
    const config = loadEnvFile(envPath);

    if (Object.keys(config).length === 0) {
      issues.push('.env file not found');
      return issues;
    }

    this.checkRequired(config, issues);
    this.checkFormats(config, issues);

    return issues;
  }

  private checkRequired(config: Record<string, string>, issues: string[]): void {
    const required = ['OMNIVORE_API_KEY'];
    for (const key of required) {
      if (!config[key] || config[key].trim() === '') {
        issues.push(`Missing required key: ${key}`);
      }
    }
  }

  private checkFormats(config: Record<string, string>, issues: string[]): void {
    if (config.OMNIVORE_API_URL && !this.isValidUrl(config.OMNIVORE_API_URL)) {
      issues.push('Invalid URL format: OMNIVORE_API_URL');
    }

    const boolKeys = ['GENERATE_SEO', 'AUTO_PUBLISH', 'CACHE_ENABLED'];
    for (const key of boolKeys) {
      if (config[key] && !['true', 'false'].includes(config[key])) {
        issues.push(`Invalid boolean value: ${key} (must be 'true' or 'false')`);
      }
    }
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private displayValidation(issues: string[]): void {
    this.log(formatHeader('Configuration Validation'));

    if (issues.length === 0) {
      this.log(formatSuccess('All configuration valid'));
    } else {
      this.log(formatError(`Found ${issues.length} issue(s):\n`));
      for (const issue of issues) {
        this.log(`  - ${issue}`);
      }
    }
  }
}
