import { BaseCommand } from '@lib/cli/base-command.js';
import { Args } from '@oclif/core';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Get specific configuration value.
 * AIDEV-NOTE: Masks sensitive values for security
 */
export default class ConfigGet extends BaseCommand {
  static override description = 'Get specific configuration value';

  static override examples = [
    '$ omc config get OMNIVORE_API_KEY',
    '$ omc config get CONTENT_OUTPUT_DIR',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to retrieve',
      required: true,
    }),
  };

  protected async execute(flags: { key: string }): Promise<void> {
    const value = this.getConfigValue(flags.key);
    if (value === undefined) {
      throw new Error(`Configuration key '${flags.key}' not found`);
    }

    this.log(this.maskValue(flags.key, value));
  }

  private getConfigValue(key: string): string | undefined {
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) {
      throw new Error('.env file not found');
    }

    const content = readFileSync(envPath, 'utf-8');

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [envKey, ...valueParts] = trimmed.split('=');
      if (envKey === key && valueParts.length > 0) {
        return valueParts.join('=');
      }
    }

    return undefined;
  }

  private maskValue(key: string, value: string): string {
    const sensitiveKeys = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD'];
    if (sensitiveKeys.some(s => key.includes(s)) && value.length > 8) {
      return `${value.slice(0, 4)}...${value.slice(-4)}`;
    }
    return value;
  }
}
