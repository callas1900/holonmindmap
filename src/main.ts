import { MindMap } from './mindmap.js';

function initializeMindMap(): void {
  const mindMap = new MindMap("#mindmap-container");
  
  // Make available globally for debugging
  (window as any).mindMap = mindMap;
  (window as any).sampleData = mindMap.getData();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMindMap);
} else {
  initializeMindMap();
}