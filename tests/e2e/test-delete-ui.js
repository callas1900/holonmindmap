const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

test('delete button UI improvements work correctly', async ({ page }) => {
  // Start HTTP server
  const server = spawn('python3', ['-m', 'http.server', '8000'], {
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // Navigate to the HTML file via HTTP
    await page.goto('http://localhost:8000/index.html');
    
    // Wait for the mindmap to load
    await page.waitForSelector('#mindmap-container');
    await page.waitForTimeout(3000);
    
    // Test 1: Check delete button positioning (should be closer to node)
    console.log('=== Testing Delete Button Position ===');
    
    // Hover over a node to show delete button
    await page.hover('circle.node-circle >> nth=0');
    await page.waitForTimeout(1000); // Wait for delete button to appear
    
    // Check if delete button is visible
    const deleteButtonVisible = await page.locator('circle.delete-button').first().isVisible();
    console.log('Delete button visible after hover:', deleteButtonVisible);
    
    // Take screenshot showing delete button
    await page.screenshot({ path: 'delete-button-visible.png' });
    
    // Test 2: Test that delete button stays visible when hovering over it
    console.log('=== Testing Delete Button Hover Persistence ===');
    
    // Move cursor to the delete button itself
    const deleteButton = page.locator('circle.delete-button').first();
    await deleteButton.hover();
    await page.waitForTimeout(500);
    
    // Check if delete button is still visible
    const stillVisible = await deleteButton.isVisible();
    console.log('Delete button still visible when hovering over it:', stillVisible);
    
    // Test 3: Test clicking the delete button
    console.log('=== Testing Delete Button Click ===');
    
    const initialCircles = await page.locator('circle.node-circle').count();
    console.log('Initial circles:', initialCircles);
    
    // Click the delete button
    await deleteButton.click();
    await page.waitForTimeout(1000);
    
    const finalCircles = await page.locator('circle.node-circle').count();
    console.log('Final circles after delete:', finalCircles);
    
    // Take final screenshot
    await page.screenshot({ path: 'after-delete-click.png' });
    
    // Verify deletion worked
    expect(finalCircles).toBeLessThan(initialCircles);
    
    // Test 4: Test delay hiding (move away and check it doesn't hide immediately)
    console.log('=== Testing Delayed Hide Functionality ===');
    
    // Hover over another node
    await page.hover('circle.node-circle >> nth=0');
    await page.waitForTimeout(500);
    
    // Move cursor away quickly
    await page.hover('body', { position: { x: 100, y: 100 } });
    
    // Check if delete button is still visible (should be due to 800ms delay)
    await page.waitForTimeout(400); // Wait less than 800ms
    const stillVisibleAfterMove = await page.locator('circle.delete-button').first().isVisible();
    console.log('Delete button still visible 400ms after mouse leave:', stillVisibleAfterMove);
    
    // Wait for full delay and check if it's hidden
    await page.waitForTimeout(600); // Total 1000ms > 800ms delay
    const hiddenAfterDelay = await page.locator('circle.delete-button').first().isVisible();
    console.log('Delete button hidden after full delay:', !hiddenAfterDelay);
    
  } finally {
    // Clean up server
    server.kill();
  }
});