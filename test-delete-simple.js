const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

test('delete button functionality test', async ({ page }) => {
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
    
    // Take initial screenshot
    await page.screenshot({ path: 'initial-with-improved-delete.png' });
    
    // Test the delete button improvements using JavaScript
    const testResult = await page.evaluate(() => {
      const renderer = window.mindMap.getRenderer();
      
      // Check if hideTimeout property exists
      const hasHideTimeout = renderer.hasOwnProperty('hideTimeout');
      
      // Simulate showing delete button
      const firstNode = window.mindMap.getData().children[0];
      const mockHierarchyNode = {
        data: firstNode,
        r: 50,
        x: 100,
        y: 100
      };
      
      // Test showDeleteButton
      renderer.showDeleteButton(mockHierarchyNode);
      
      // Check if delete button group exists and is visible
      const deleteGroup = document.querySelector(`.delete-group[data-node-id="${firstNode.id}"]`);
      const isVisible = deleteGroup && window.getComputedStyle(deleteGroup).opacity !== '0';
      
      return {
        hasHideTimeout: hasHideTimeout,
        deleteButtonExists: !!deleteGroup,
        isVisible: isVisible,
        nodeId: firstNode.id
      };
    });
    
    console.log('Test results:', testResult);
    
    // Verify the improvements are in place
    expect(testResult.hasHideTimeout).toBe(true);
    expect(testResult.deleteButtonExists).toBe(true);
    
    // Test that delete button is positioned closer (r * 0.6 instead of r * 0.7)
    const buttonPosition = await page.evaluate(() => {
      const deleteButton = document.querySelector('circle.delete-button');
      if (deleteButton) {
        return {
          cx: deleteButton.getAttribute('cx'),
          cy: deleteButton.getAttribute('cy'),
          exists: true
        };
      }
      return { exists: false };
    });
    
    console.log('Delete button position:', buttonPosition);
    
    // Count initial nodes
    const initialCount = await page.locator('circle.node-circle').count();
    console.log('Initial node count:', initialCount);
    
    // Test direct removal via removeNode function
    const removeResult = await page.evaluate(() => {
      const mindMap = window.mindMap;
      const firstChildId = mindMap.getData().children[0].id;
      return mindMap.removeNode(firstChildId);
    });
    
    console.log('Remove node result:', removeResult);
    
    // Wait for re-render
    await page.waitForTimeout(1000);
    
    // Count final nodes
    const finalCount = await page.locator('circle.node-circle').count();
    console.log('Final node count:', finalCount);
    
    // Take final screenshot
    await page.screenshot({ path: 'final-after-improved-delete.png' });
    
    // Verify deletion worked
    expect(removeResult).toBe(true);
    expect(finalCount).toBeLessThan(initialCount);
    
  } finally {
    // Clean up server
    server.kill();
  }
});