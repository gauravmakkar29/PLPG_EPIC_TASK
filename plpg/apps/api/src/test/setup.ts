import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/plpg_test';
  process.env.CLERK_SECRET_KEY = 'sk_test_mock';
});

afterAll(() => {
  // Cleanup
});
