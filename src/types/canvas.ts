export type Tool = 'line' | 'box' | 'circle' | 'draw' | 'move' | 'delete' | 'measure' | 'select';

export interface DrawingObject {
  id: string;
  type: 'line' | 'rect' | 'circle' | 'path';
  data: Record<string, unknown>;
  color: string;
  strokeWidth: number;
}

export interface CanvasState {
  objects: DrawingObject[];
  selectedTool: Tool;
  gridEnabled: boolean;
  zoom: number;
  strokeColor: string;
  strokeWidth: number;
}

export interface HistoryState {
  past: string[];
  present: string;
  future: string[];
}
