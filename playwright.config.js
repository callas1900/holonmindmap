module.exports = {
  testDir: './',
  testMatch: '**/*test*.js',
  use: {
    headless: true,
    screenshot: 'only-on-failure',
  },
};