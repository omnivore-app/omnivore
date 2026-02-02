import { BaseCommand } from '@lib/cli/base-command.js';
import { jsonFlag } from '@lib/cli/shared-flags.js';
import { outputResult } from '@lib/cli/command-utils.js';
import { initDatabase } from '@storage/database.js';
import { testConnection } from '@lib/omnivore/client.js';
import { existsSync } from 'fs';
import { config } from 'dotenv';

/**
 * System health check for omnivore-content-system
 * AIDEV-NOTE: doctor-command - diagnostic tool for troubleshooting setup issues
 */
export default class Doctor extends BaseCommand {
  static override description = 'Check system health and configuration';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --json',
  ];

  static override flags = {
    json: jsonFlag(),
  };

  protected async execute(flags: { json: boolean }): Promise<void> {
    const checks = {
      database: await this.checkDatabase(),
      apiKey: this.checkApiKey(),
      apiConnection: await this.checkApiConnection(),
      directories: this.checkDirectories(),
      dependencies: this.checkDependencies(),
    };

    const allHealthy = Object.values(checks).every(check => check.healthy);

    if (flags.json) {
      outputResult(this, { checks, healthy: allHealthy }, '', true);
    } else {
      this.displayHealthReport(checks, allHealthy);
    }

    if (!allHealthy) {
      process.exit(1);
    }
  }

  private async checkDatabase(): Promise<CheckResult> {
    try {
      initDatabase('data/omnivore-content.db');
      return { healthy: true, message: 'Database connection OK' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { healthy: false, message: `Database error: ${message}` };
    }
  }

  private checkApiKey(): CheckResult {
    config();
    if (process.env.OMNIVORE_API_KEY) {
      return { healthy: true, message: 'OMNIVORE_API_KEY found' };
    }
    return { healthy: false, message: 'OMNIVORE_API_KEY not set' };
  }

  private async checkApiConnection(): Promise<CheckResult> {
    config();
    if (!process.env.OMNIVORE_API_KEY) {
      return { healthy: false, message: 'Cannot test - API key missing' };
    }

    const connected = await testConnection();
    if (connected) {
      return { healthy: true, message: 'API connection successful' };
    }
    return { healthy: false, message: 'API connection failed' };
  }

  private checkDirectories(): CheckResult {
    const required = ['data', 'content', 'temp'];
    const missing = required.filter(dir => !existsSync(dir));

    if (missing.length === 0) {
      return { healthy: true, message: 'All required directories exist' };
    }
    return { healthy: false, message: `Missing directories: ${missing.join(', ')}` };
  }

  private checkDependencies(): CheckResult {
    const nodeVersion = process.version;
    const requiredMajor = 18;
    const currentMajor = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (currentMajor >= requiredMajor) {
      return { healthy: true, message: `Node ${nodeVersion} (>= ${requiredMajor})` };
    }
    return { healthy: false, message: `Node ${nodeVersion} (requires >= ${requiredMajor})` };
  }

  private displayHealthReport(checks: Record<string, CheckResult>, allHealthy: boolean): void {
    this.log('\nSystem Health Report\n');

    for (const [name, check] of Object.entries(checks)) {
      const icon = check.healthy ? '✓' : '✗';
      const label = name.padEnd(20);
      this.log(`${icon} ${label} ${check.message}`);
    }

    this.log(`\nOverall Status: ${allHealthy ? '✓ Healthy' : '✗ Issues detected'}`);
  }
}

interface CheckResult {
  healthy: boolean;
  message: string;
}
