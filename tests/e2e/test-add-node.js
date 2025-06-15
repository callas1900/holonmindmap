const { test, expect } = require('@playwright/test');
const { spawn } = require('child_process');

test('unified add node architecture works correctly', async ({ page }) => {
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
    await page.screenshot({ path: 'initial-add-node-test.png' });
    
    // Count initial nodes
    const initialCount = await page.locator('circle.node-circle').count();
    console.log('Initial node count:', initialCount);
    
    // Test 1: Verify onAddNode callback exists
    const callbackTest = await page.evaluate(() => {
      const renderer = window.mindMap.getRenderer();
      return {
        hasOnAddNode: typeof renderer.config.onAddNode === 'function',
        configExists: !!renderer.config
      };
    });
    
    console.log('Callback test results:', callbackTest);
    expect(callbackTest.hasOnAddNode).toBe(true);
    
    // Test 2: Test addNode via MindMap class (direct call)
    const addNodeDirectResult = await page.evaluate(() => {
      const mindMap = window.mindMap;
      const initialChildrenCount = mindMap.getData().children.length;
      
      // Add a node directly via MindMap.addNode
      const newNode = mindMap.addNode("Test Node Direct");
      
      return {
        success: !!newNode,
        newNodeId: newNode ? newNode.id : null,
        newChildrenCount: mindMap.getData().children.length,
        initialChildrenCount: initialChildrenCount
      };
    });
    
    console.log('Direct addNode result:', addNodeDirectResult);
    expect(addNodeDirectResult.success).toBe(true);
    expect(addNodeDirectResult.newChildrenCount).toBe(addNodeDirectResult.initialChildrenCount + 1);
    
    // Wait for re-render
    await page.waitForTimeout(1000);
    
    // Count nodes after direct add
    const countAfterDirect = await page.locator('circle.node-circle').count();
    console.log('Node count after direct add:', countAfterDirect);
    expect(countAfterDirect).toBeGreaterThan(initialCount);
    
    // Test 3: Test addNodeAtPosition via renderer (using callback)
    const addNodePositionResult = await page.evaluate(() => {
      const renderer = window.mindMap.getRenderer();
      const initialChildrenCount = window.mindMap.getData().children.length;
      
      // Create a mock mouse event
      const mockEvent = {
        clientX: 300,
        clientY: 300
      };
      
      // Call addNodeAtPosition which should use the callback
      renderer.addNodeAtPosition(mockEvent);
      
      return {
        newChildrenCount: window.mindMap.getData().children.length,
        initialChildrenCount: initialChildrenCount
      };
    });
    
    console.log('AddNodeAtPosition result:', addNodePositionResult);
    expect(addNodePositionResult.newChildrenCount).toBe(addNodePositionResult.initialChildrenCount + 1);
    
    // Wait for re-render
    await page.waitForTimeout(1000);
    
    // Count final nodes
    const finalCount = await page.locator('circle.node-circle').count();
    console.log('Final node count:', finalCount);
    
    // Take final screenshot
    await page.screenshot({ path: 'final-add-node-test.png' });
    
    // Verify both add operations worked
    expect(finalCount).toBeGreaterThan(countAfterDirect);
    
    // Test 4: Verify data consistency
    const dataConsistencyTest = await page.evaluate(() => {
      const mindMapData = window.mindMap.getData();
      const rendererData = window.mindMap.getRenderer().getData();
      
      return {
        mindMapChildrenCount: mindMapData.children.length,
        rendererChildrenCount: rendererData ? rendererData.children.length : 0,
        dataMatches: JSON.stringify(mindMapData) === JSON.stringify(rendererData)
      };
    });
    
    console.log('Data consistency test:', dataConsistencyTest);
    expect(dataConsistencyTest.dataMatches).toBe(true);
    
  } finally {
    // Clean up server
    server.kill();
  }
});