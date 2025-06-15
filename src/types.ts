export interface MindMapNodeData {
  id: string;
  title: string;
  children: MindMapNodeData[];
}

export class MindMapNode implements MindMapNodeData {
  public id: string;
  public title: string;
  public children: MindMapNodeData[];

  constructor(title: string = "New Node", children: MindMapNodeData[] = []) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.title = title;
    this.children = children;
  }
}

export interface MindMapRendererConfig {
  containerId: string;
  width?: number;
  height?: number;
  onDeleteNode?: (nodeId: string) => boolean;
  onUpdateNode?: (nodeId: string, newTitle: string) => boolean;
}

export interface NodePosition {
  x: number;
  y: number;
  r: number;
}

export interface EditingState {
  node: any;
  inputElement: HTMLInputElement | null;
}