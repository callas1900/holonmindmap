# How to Build

## Prerequisites
- Node.js (version 14 or higher)
- npm

## Installation
```bash
npm install
```

## Build Commands
```bash
# Build once
npm run build

# Watch for changes and auto-build
npm run watch

# Clean build directory
npm run clean
```

## Development
```bash
# Start development with auto-rebuild
npm run dev

# Serve the application via HTTP (required for ES modules)
npm run serve
```

After building, open http://localhost:8000 in your browser to use the mind map tool.

**Important**: Due to CORS restrictions with ES modules, you cannot open `index.html` directly in your browser. You must serve the files via HTTP using `npm run serve`.

## Testing

### Prerequisites for Testing
```bash
# Install Playwright (already included in devDependencies)
npm install

# Install browser for testing
npx playwright install chromium
```

### Running Tests
```bash
# Run all tests
npx playwright test

# Run tests with detailed output
npx playwright test --reporter=line
```

### Test Files
- `test-mindmap.js` - Main test file that verifies the mindmap loads and renders correctly
- `playwright.config.js` - Playwright configuration

The test automatically:
1. Starts an HTTP server on port 8000
2. Loads the mindmap application
3. Verifies D3.js loads correctly
4. Checks that SVG elements and circles are rendered
5. Takes screenshots for debugging
6. Captures console messages and errors

### Troubleshooting Tests
If tests fail, check the generated screenshots in `test-results/` directory and console output for error messages.