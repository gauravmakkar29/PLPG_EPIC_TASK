import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Setup test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/plpg_test';
  process.env.JWT_SECRET = 'test_jwt_secret';
});

afterAll(() => {
  // Cleanup
});
