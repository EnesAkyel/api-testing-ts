const base = require('./jest.base.config');

module.exports = {
  ...base,
  testMatch: ['**/*.contract.test.ts'],
  testTimeout: 30000,
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'contract-junit.xml' }],
    ['jest-html-reporters', { publicPath: 'reports', filename: 'contract-report.html', expand: true }],
  ],
};