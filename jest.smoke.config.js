const base = require('./jest.base.config');

module.exports = {
  ...base,
  testMatch: ['**/*.smoke.test.ts'],
  testTimeout: 15000,
  verbose: true,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'smoke-junit.xml' }],
    ['jest-html-reporters', { publicPath: 'reports', filename: 'smoke-report.html', expand: true }],
  ],
};