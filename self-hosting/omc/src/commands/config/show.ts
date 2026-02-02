import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { formatHeader } from '@lib/cli/formatters.js';
import { loadEnvFile } from '@lib/cli/command-utils.js';
import { join } from 'path';

/**
 * Show all configuration values.
 * AIDEV-NOTE: Masks sensitive values (API keys show first/last 4 chars)
 */
export default class ConfigShow extends BaseCommand {
  static override description = 'Show all configuration values';

  static override examples = [
    '$ omc config show',
    '$ omc config show --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  async execute(flags: any): Promise<void> {
    const envPath = join(process.cwd(), '.env');
    const rawConfig = loadEnvFile(envPath);

    if (Object.keys(rawConfig).length === 0) {
      throw new Error('.env file not found');
    }

    const config = this.maskSensitiveValues(rawConfig);

    if (flags.json) {
      this.log(JSON.stringify(config, null, 2));
    } else {
      this.displayConfig(config);
    }
  }

  private maskSensitiveValues(config: Record<string, string>): Record<string, string> {
    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(config)) {
      masked[key] = this.maskValue(key, value);
    }
    return masked;
  }

  private maskValue(key: string, value: string): string {
    const sensitiveKeys = ['KEY', 'TOKEN', 'SECRET', 'PASSWORD'];
    if (sensitiveKeys.some(s => key.includes(s)) && value.length > 8) {
      return `${value.slice(0, 4)}...${value.slice(-4)}`;
    }
    return value;
  }

  private displayConfig(config: Record<string, string>): void {
    this.log(formatHeader('Configuration'));
    for (const [key, value] of Object.entries(config)) {
      this.log(`${key.padEnd(30)} ${value}`);
    }
  }
}
