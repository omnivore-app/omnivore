import { config } from 'dotenv';
import { beforeAll } from 'vitest';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

beforeAll(() => {
  // Global test setup if needed
});
