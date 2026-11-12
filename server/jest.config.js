/** Jest runs the TypeScript sources directly through ts-jest (type errors fail the tests). */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/helpers/env.ts'],
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/types/**'],
};
