import { BaseCommand } from '@lib/cli/base-command.js';
import { Args } from '@oclif/core';
import { formatSuccess } from '@lib/cli/formatters.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Set configuration value.
 * AIDEV-NOTE: Validates key exists in .env.example before updating
 */
export default class ConfigSet extends BaseCommand {
  static override description = 'Set configuration value';

  static override examples = [
    '$ omc config set CONTENT_OUTPUT_DIR ./my-content',
    '$ omc config set AUTO_PUBLISH true',
  ];

  static override args = {
    key: Args.string({
      description: 'Configuration key to set',
      required: true,
    }),
    value: Args.string({
      description: 'Value to set',
      required: true,
    }),
  };

  protected async execute(flags: { key: string; value: string }): Promise<void> {
    this.validateKey(flags.key);
    this.updateEnvFile(flags.key, flags.value);
    this.log(formatSuccess(`Set ${flags.key} = ${flags.value}`));
  }

  private validateKey(key: string): void {
    const examplePath = join(process.cwd(), '.env.example');
    if (!existsSync(examplePath)) return;

    const content = readFileSync(examplePath, 'utf-8');
    const validKeys = content
      .split('\n')
      .filter(line => !line.trim().startsWith('#') && line.includes('='))
      .map(line => line.split('=')[0]);

    if (!validKeys.includes(key)) {
      throw new Error(`Unknown config key: ${key}`);
    }
  }

  private updateEnvFile(key: string, value: string): void {
    const envPath = join(process.cwd(), '.env');
    let content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

    const lines = content.split('\n');
    let updated = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith(key + '=')) {
        lines[i] = `${key}=${value}`;
        updated = true;
        break;
      }
    }

    if (!updated) {
      lines.push(`${key}=${value}`);
    }

    writeFileSync(envPath, lines.join('\n'));
  }
}
