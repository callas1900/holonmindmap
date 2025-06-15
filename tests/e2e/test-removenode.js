const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

test('removeNode function works correctly', async ({ page }) => {
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
    
    // Count initial circles
    const initialCircles = await page.locator('circle.node-circle').count();
    console.log('Initial circles:', initialCircles);
    
    // Test removeNode function via console
    const removeResult = await page.evaluate(() => {
      // Get the first child node ID
      const mindMap = window.mindMap;
      const firstChildId = mindMap.getData().children[0].id;
      console.log('Removing node with ID:', firstChildId);
      
      // Remove the node using the removeNode function
      const result = mindMap.removeNode(firstChildId);
      console.log('Remove result:', result);
      
      return {
        result: result,
        nodeId: firstChildId,
        newChildrenCount: mindMap.getData().children.length
      };
    });
    
    console.log('Remove operation result:', removeResult);
    
    // Wait for re-render
    await page.waitForTimeout(1000);
    
    // Count circles after removal
    const finalCircles = await page.locator('circle.node-circle').count();
    console.log('Final circles:', finalCircles);
    
    // Take screenshot after removal
    await page.screenshot({ path: 'after-removal.png' });
    
    // Verify that removeNode worked
    expect(removeResult.result).toBe(true);
    expect(finalCircles).toBeLessThan(initialCircles);
    
    // Test removing a node by clicking delete button
    await page.hover('circle.node-circle >> nth=0');
    await page.waitForTimeout(500); // Wait for delete button to appear
    
    const deleteButtons = await page.locator('circle.delete-button').count();
    console.log('Delete buttons visible:', deleteButtons);
    
    if (deleteButtons > 0) {
      const circlesBeforeClick = await page.locator('circle.node-circle').count();
      await page.click('circle.delete-button >> nth=0');
      await page.waitForTimeout(1000);
      const circlesAfterClick = await page.locator('circle.node-circle').count();
      
      console.log('Circles before click:', circlesBeforeClick);
      console.log('Circles after click:', circlesAfterClick);
      
      expect(circlesAfterClick).toBeLessThan(circlesBeforeClick);
    }
    
  } finally {
    // Clean up server
    server.kill();
  }
});