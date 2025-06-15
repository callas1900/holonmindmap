const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

test('mindmap loads with HTTP server', async ({ page }) => {
  // Start HTTP server
  const server = spawn('python3', ['-m', 'http.server', '8000'], {
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Capture console messages
    const messages = [];
    page.on('console', msg => {
      messages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      messages.push(`PAGE ERROR: ${error.message}`);
    });
    
    // Navigate to the HTML file via HTTP
    await page.goto('http://localhost:8000/index.html');
    
    // Wait for the mindmap container
    await page.waitForSelector('#mindmap-container');
    
    // Wait for scripts to load and execute
    await page.waitForTimeout(3000);
    
    // Take a screenshot
    await page.screenshot({ path: 'working-mindmap.png' });
    
    // Log console messages
    console.log('=== Console Messages ===');
    messages.forEach(msg => console.log(msg));
    
    // Check if D3 is loaded
    const d3Loaded = await page.evaluate(() => typeof window.d3 !== 'undefined');
    console.log('D3 loaded:', d3Loaded);
    
    // Check if mindMap instance exists
    const mindMapExists = await page.evaluate(() => typeof window.mindMap !== 'undefined');
    console.log('MindMap instance exists:', mindMapExists);
    
    // Check for SVG elements
    const svgCount = await page.locator('svg').count();
    console.log('SVG elements:', svgCount);
    
    // Check for circles (mindmap nodes)
    const circleCount = await page.locator('circle').count();
    console.log('Circle elements:', circleCount);
    
    // Verify mindmap is working
    expect(svgCount).toBeGreaterThan(0);
    expect(circleCount).toBeGreaterThan(0);
    
  } finally {
    // Clean up server
    server.kill();
  }
});