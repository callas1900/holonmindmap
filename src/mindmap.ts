import { MindMapNode, MindMapNodeData } from './types.js';
import { MindMapRenderer } from './d3-renderer.js';

export class MindMap {
  private renderer: MindMapRenderer;
  private data: MindMapNodeData;

  constructor(containerId: string, initialData?: MindMapNodeData) {
    this.data = initialData || this.createSampleData();
    this.renderer = new MindMapRenderer({ 
      containerId,
      onDeleteNode: (nodeId: string) => this.removeNode(nodeId),
      onUpdateNode: (nodeId: string, newTitle: string) => this.updateNode(nodeId, newTitle),
      onAddNode: (parentId?: string) => this.addNode("New Node", parentId)
    });
    this.render();
  }

  private createSampleData(): MindMapNodeData {
    return new MindMapNode("Central Idea", [
      new MindMapNode("Branch 1", [
        new MindMapNode("Sub 1.1"),
        new MindMapNode("Sub 1.2")
      ]),
      new MindMapNode("Branch 2", [
        new MindMapNode("Sub 2.1"),
        new MindMapNode("Sub 2.2", [
          new MindMapNode("Sub 2.2.1")
        ])
      ]),
      new MindMapNode("Branch 3")
    ]);
  }

  public render(): void {
    this.renderer.render(this.data);
  }

  public addNode(title: string, parentId?: string): MindMapNodeData {
    const newNode = new MindMapNode(title);
    
    if (parentId) {
      const parent = this.findNodeById(parentId);
      if (parent) {
        parent.children.push(newNode);
      } else {
        this.data.children.push(newNode);
      }
    } else {
      this.data.children.push(newNode);
    }
    
    this.render();
    return newNode;
  }

  public removeNode(nodeId: string): boolean {
    const removeFromChildren = (children: MindMapNodeData[]): boolean => {
      const index = children.findIndex(child => child.id === nodeId);
      if (index > -1) {
        children.splice(index, 1);
        return true;
      }
      
      for (const child of children) {
        if (removeFromChildren(child.children)) {
          return true;
        }
      }
      return false;
    };

    if (this.data.id === nodeId) {
      return false;
    }

    const removed = removeFromChildren(this.data.children);
    if (removed) {
      this.render();
    }
    return removed;
  }

  public updateNode(nodeId: string, newTitle: string): boolean {
    const node = this.findNodeById(nodeId);
    if (node) {
      node.title = newTitle;
      this.render();
      return true;
    }
    return false;
  }

  public findNodeById(nodeId: string): MindMapNodeData | null {
    const search = (node: MindMapNodeData): MindMapNodeData | null => {
      if (node.id === nodeId) {
        return node;
      }
      
      for (const child of node.children) {
        const found = search(child);
        if (found) {
          return found;
        }
      }
      return null;
    };

    return search(this.data);
  }

  public getData(): MindMapNodeData {
    return this.data;
  }

  public setData(data: MindMapNodeData): void {
    this.data = data;
    this.render();
  }

  public exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.setData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  public getRenderer(): MindMapRenderer {
    return this.renderer;
  }
}