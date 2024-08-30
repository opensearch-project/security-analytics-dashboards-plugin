/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

module.exports = {
  rootDir: '../',
  setupFiles: ['<rootDir>/test/polyfills.ts', '<rootDir>/test/setupTests.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.jest.ts'],
  roots: ['<rootDir>'],
  coverageDirectory: './coverage',
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/test/mocks/styleMock.ts',
    '^ui/(.*)': '<rootDir>/../../src/legacy/ui/public/$1/',
    '.*content_management/public.*': '<rootDir>/test/mocks/contentManagementMocks.ts',
  },
  coverageReporters: ['lcov', 'text', 'cobertura'],
  testMatch: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
  collectCoverageFrom: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '!**/models/**',
    '!**/node_modules/**',
    '!**/index.ts',
    '!<rootDir>/index.js',
    '!<rootDir>/public/app.js',
    '!<rootDir>/public/temporary/**',
    '!<rootDir>/babel.config.js',
    '!<rootDir>/test/**',
    '!<rootDir>/server/**',
    '!<rootDir>/coverage/**',
    '!<rootDir>/scripts/**',
    '!<rootDir>/build/**',
    '!<rootDir>/cypress/**',
    '!**/vendor/**',
  ],
  clearMocks: true,
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [
    // ignore all node_modules except those which require babel transforms to
    // handle newer syntax like `??=` which is not already transformed by the
    // package and not yet supported in the node version we use.
    '[/\\\\]node_modules(?![\\/\\\\](vega-lite))[/\\\\].+\\.js$',
  ],
  modulePathIgnorePatterns: ['securityAnalyticsDashboards'],
  testEnvironment: 'jsdom',
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
