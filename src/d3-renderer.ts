// @ts-nocheck
declare const d3: any;
import { MindMapNodeData, MindMapRendererConfig, NodePosition } from './types.js';
import { InputHandler } from './input-handler.js';

export class MindMapRenderer {
  private container: d3.Selection<HTMLElement, unknown, HTMLElement, any>;
  private svg!: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private g!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private width: number;
  private height: number;
  private data: MindMapNodeData | null = null;
  private selectedNode: any = null;
  private inputHandler: InputHandler;
  private config: MindMapRendererConfig;
  private hideTimeout: any = null;

  constructor(config: MindMapRendererConfig) {
    this.config = config;
    this.container = d3.select(config.containerId);
    this.width = config.width || window.innerWidth;
    this.height = config.height || window.innerHeight;
    
    this.initSVG();
    this.setupZoom();
    this.inputHandler = new InputHandler(this);
    this.setupEventListeners();
  }

  private initSVG(): void {
    this.svg = this.container
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.g = this.svg.append("g");
  }

  private setupZoom(): void {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", (event) => {
        this.g.attr("transform", event.transform);
      });

    this.svg.call(zoom);
  }

  private setupEventListeners(): void {
    this.svg.on("click", (event) => {
      if (event.target === event.currentTarget) {
        this.inputHandler.handleCanvasClick(event);
      }
    });

    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.svg.attr("width", this.width).attr("height", this.height);
      if (this.data) {
        this.render(this.data);
      }
    });
  }

  public render(data: MindMapNodeData): void {
    this.data = data;
    
    const root = d3.hierarchy(data);
    
    const pack = d3.pack<MindMapNodeData>()
      .size([this.width * 0.8, this.height * 0.8])
      .padding(10);

    const packedRoot = pack(root.sum(() => 1));

    const offsetX = this.width * 0.1;
    const offsetY = this.height * 0.1;

    this.g.selectAll("*").remove();

    const nodeGroup = this.g.selectAll<SVGGElement, d3.HierarchyCircularNode<MindMapNodeData>>(".node-group")
      .data(packedRoot.descendants())
      .enter()
      .append("g")
      .attr("class", "node-group")
      .attr("transform", d => `translate(${d.x + offsetX}, ${d.y + offsetY})`);

    nodeGroup.append("circle")
      .attr("class", "node-circle")
      .attr("r", d => d.r)
      .attr("data-node-id", d => d.data.id)
      .on("click", (event, d) => {
        event.stopPropagation();
        this.selectNode(d);
      })
      .on("dblclick", (event, d) => {
        event.stopPropagation();
        this.inputHandler.startEditing(d, event);
      })
      .on("mouseenter", (event, d) => {
        this.showDeleteButton(d);
      })
      .on("mouseleave", (event, d) => {
        this.hideDeleteButton(d);
      });

    nodeGroup.append("text")
      .attr("class", "node-text")
      .attr("data-node-id", d => d.data.id)
      .text(d => this.truncateText(d.data.title, d.r))
      .style("font-size", d => Math.min(d.r / 3, 14) + "px");

    const deleteGroup = nodeGroup.append("g")
      .attr("class", "delete-group")
      .attr("data-node-id", d => d.data.id)
      .style("opacity", 0);

    deleteGroup.append("circle")
      .attr("class", "delete-button")
      .attr("cx", d => d.r * 0.6)
      .attr("cy", d => -d.r * 0.6)
      .attr("r", 12)
      .on("click", (event, d) => {
        event.stopPropagation();
        this.deleteNode(d);
      })
      .on("mouseenter", (event, d) => {
        this.showDeleteButton(d);
      })
      .on("mouseleave", (event, d) => {
        this.hideDeleteButton(d);
      });

    deleteGroup.append("text")
      .attr("class", "delete-text")
      .attr("x", d => d.r * 0.6)
      .attr("y", d => -d.r * 0.6)
      .text("×")
      .on("mouseenter", (event, d) => {
        this.showDeleteButton(d);
      })
      .on("mouseleave", (event, d) => {
        this.hideDeleteButton(d);
      });
  }

  private truncateText(text: string, radius: number): string {
    const maxLength = Math.floor(radius / 5);
    return text.length > maxLength ? text.substr(0, maxLength) + "..." : text;
  }

  public selectNode(d: d3.HierarchyCircularNode<MindMapNodeData>): void {
    this.g.selectAll(".node-circle").classed("selected", false);
    this.selectedNode = d;
    this.g.select(`[data-node-id="${d.data.id}"]`).classed("selected", true);
  }

  public showDeleteButton(d: d3.HierarchyCircularNode<MindMapNodeData>): void {
    // Clear any existing timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    
    this.g.select(`.delete-group[data-node-id="${d.data.id}"]`)
      .transition()
      .duration(200)
      .style("opacity", 1);
  }

  public hideDeleteButton(d: d3.HierarchyCircularNode<MindMapNodeData>): void {
    // Use timeout to delay hiding
    this.hideTimeout = setTimeout(() => {
      this.g.select(`.delete-group[data-node-id="${d.data.id}"]`)
        .transition()
        .duration(200)
        .style("opacity", 0);
      this.hideTimeout = null;
    }, 800);
  }

  public deleteNode(d: d3.HierarchyCircularNode<MindMapNodeData>): void {
    if (this.config.onDeleteNode) {
      // Use the callback to delete the node
      this.config.onDeleteNode(d.data.id);
    } else {
      // Fallback to direct manipulation (legacy behavior)
      if (d.parent && this.data) {
        const siblings = d.parent.data.children;
        const index = siblings.indexOf(d.data);
        if (index > -1) {
          siblings.splice(index, 1);
          this.render(this.data);
        }
      }
    }
  }

  public addNodeAtPosition(event: MouseEvent): void {
    if (!this.data) return;
    
    const [x, y] = d3.pointer(event);
    
    if (this.config.onAddNode) {
      // Use the callback to add the node
      this.config.onAddNode();
    } else {
      // Fallback to direct manipulation (legacy behavior)
      this.data.children.push({
        id: Math.random().toString(36).substr(2, 9),
        title: "New Node",
        children: []
      });
      this.render(this.data);
    }
  }

  public getData(): MindMapNodeData | null {
    return this.data;
  }

  public getContainer(): d3.Selection<HTMLElement, unknown, HTMLElement, any> {
    return this.container;
  }

  public getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}