const base = require('./jest.base.config');

module.exports = {
  ...base,
  transform: {
    '^.+\\.(js|ts)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!axios)'],
  testMatch: ['**/src/tests/regression-tests/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 2,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'regression-junit.xml' }],
    ['jest-html-reporters', { publicPath: 'reports', filename: 'regression-report.html', expand: true }],
  ],
};