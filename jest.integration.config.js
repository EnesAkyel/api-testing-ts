const base = require('./jest.base.config');

module.exports = {
  ...base,
  testMatch: ['<rootDir>/src/tests/*.test.ts'],
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'integration-junit.xml' }],
    ['jest-html-reporters', { publicPath: 'reports', filename: 'integration-report.html', expand: true }],
  ],
};