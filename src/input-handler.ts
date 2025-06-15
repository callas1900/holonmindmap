// @ts-nocheck
declare const d3: any;
import { MindMapNodeData, EditingState } from './types.js';

export class InputHandler {
  private renderer: any;
  private editingState: EditingState | null = null;

  constructor(renderer: any) {
    this.renderer = renderer;
  }

  public handleCanvasClick(event: MouseEvent): void {
    this.renderer.addNodeAtPosition(event);
  }

  public startEditing(d: d3.HierarchyCircularNode<MindMapNodeData>, event: Event): void {
    if (this.editingState) return;
    
    const container = this.renderer.getContainer();
    const dimensions = this.renderer.getDimensions();
    
    this.editingState = {
      node: d,
      inputElement: null
    };
    
    const input = container
      .append("input")
      .attr("class", "editing-input")
      .attr("type", "text")
      .attr("value", d.data.title)
      .style("left", (d.x + dimensions.width * 0.1 - 50) + "px")
      .style("top", (d.y + dimensions.height * 0.1 - 10) + "px")
      .style("width", "100px");

    this.editingState.inputElement = input.node() as HTMLInputElement;
    
    if (this.editingState.inputElement) {
      this.editingState.inputElement.focus();
      this.editingState.inputElement.select();
    }

    const finishEditing = () => {
      if (!this.editingState || !this.editingState.inputElement) return;
      
      const newTitle = this.editingState.inputElement.value.trim();
      if (newTitle) {
        d.data.title = newTitle;
        const data = this.renderer.getData();
        if (data) {
          this.renderer.render(data);
        }
      }
      input.remove();
      this.editingState = null;
    };

    const cancelEditing = () => {
      if (this.editingState) {
        input.remove();
        this.editingState = null;
      }
    };

    input.on("blur", finishEditing);
    input.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        finishEditing();
      } else if (event.key === "Escape") {
        cancelEditing();
      }
    });
  }

  public isEditing(): boolean {
    return this.editingState !== null;
  }

  public cancelEditing(): void {
    if (this.editingState) {
      if (this.editingState.inputElement) {
        d3.select(this.editingState.inputElement).remove();
      }
      this.editingState = null;
    }
  }
}