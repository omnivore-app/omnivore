import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { outputResult } from '@lib/cli/command-utils.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Display version and system information
 * AIDEV-NOTE: version-command - shows package version and runtime environment
 */
export default class Version extends BaseCommand {
  static override description = 'Show version and system information';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { json: boolean }): Promise<void> {
    const info = {
      version: this.getPackageVersion(),
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    if (flags.json) {
      outputResult(this, info, '', true);
    } else {
      this.displayVersionTable(info);
    }
  }

  private getPackageVersion(): string {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const pkgPath = join(__dirname, '../../../package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      return pkg.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private displayVersionTable(info: SystemInfo): void {
    this.log('\nOmnivore Content System\n');
    this.log(`Version:      ${info.version}`);
    this.log(`Node:         ${info.node}`);
    this.log(`Platform:     ${info.platform}`);
    this.log(`Architecture: ${info.arch}`);
  }
}

interface SystemInfo {
  version: string;
  node: string;
  platform: string;
  arch: string;
}
