module.exports = {
  testDir: './tests/e2e',
  testMatch: '**/*test*.js',
  use: {
    headless: true,
    screenshot: 'only-on-failure',
  },
};