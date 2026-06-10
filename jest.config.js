const base = require('./jest.base.config');

module.exports = {
  ...base,
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'reports', outputName: 'junit.xml' }],
    ['jest-html-reporters', { publicPath: 'reports', filename: 'report.html', expand: true }],
  ],
};