# Claude Code Instructions for HolonMindMap Project

## Testing Guidelines

### UI-Based Tests Only
- **CREATE**: Tests that simulate actual user interactions (clicks, hovers, keyboard input)
- **CREATE**: Tests that verify visual elements and their behavior
- **CREATE**: Tests that check UI state changes and visual feedback

### DO NOT CREATE Function-Based Tests
- **AVOID**: Tests that directly call JavaScript functions like `removeNode()`, `addNode()`
- **AVOID**: Tests that bypass the UI to test internal APIs
- **AVOID**: Tests that use `page.evaluate()` to call methods directly instead of simulating user actions

### Examples of Good UI Tests
```javascript
// Good: Simulates actual user interaction
await page.hover('circle.node-circle');
await page.click('circle.delete-button');

// Good: Tests visual behavior
const deleteButtonVisible = await page.locator('circle.delete-button').isVisible();
```

### Examples of Tests to Avoid
```javascript
// Bad: Direct function call instead of UI interaction
const removeResult = await page.evaluate(() => {
  return window.mindMap.removeNode(nodeId);
});

// Bad: Testing internal API instead of user experience
const newNode = mindMap.addNode("Test Node");
```

## Test File Naming
- Use descriptive names that indicate UI behavior: `test-delete-ui.js`, `test-node-editing.js`
- Avoid function-based names: `test-removenode.js`, `test-addnode.js`

## Focus Areas for Testing
1. User interactions (clicks, hovers, keyboard input)
2. Visual feedback and state changes
3. UI element positioning and visibility
4. Responsive behavior and styling
5. Accessibility features

Remember: Test what users see and do, not internal function calls.