import { DxfWriter, point3d } from '@tarikjabiri/dxf';
import DxfParser from 'dxf-parser';

interface CanvasObject {
  type: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  radius?: number;
  stroke?: string;
  strokeWidth?: number;
  path?: Array<{ x: number; y: number }>;
  [key: string]: unknown;
}

interface CanvasData {
  objects?: CanvasObject[];
  [key: string]: unknown;
}

/**
 * Export canvas data to DXF format
 */
export function exportToDXF(canvasData: CanvasData): string {
  const dxf = new DxfWriter();

  if (canvasData.objects && Array.isArray(canvasData.objects)) {
    for (const obj of canvasData.objects) {
      switch (obj.type) {
        case 'line':
          if (obj.x1 !== undefined && obj.y1 !== undefined && obj.x2 !== undefined && obj.y2 !== undefined) {
            dxf.addLine(
              point3d(obj.x1, -obj.y1, 0), // Flip Y for CAD coordinate system
              point3d(obj.x2, -obj.y2, 0)
            );
          }
          break;
          
        case 'rect':
          if (obj.left !== undefined && obj.top !== undefined && obj.width !== undefined && obj.height !== undefined) {
            // Draw rectangle as 4 lines
            const x = obj.left;
            const y = -obj.top; // Flip Y
            const w = obj.width;
            const h = obj.height;
            
            dxf.addLine(point3d(x, y, 0), point3d(x + w, y, 0));
            dxf.addLine(point3d(x + w, y, 0), point3d(x + w, y - h, 0));
            dxf.addLine(point3d(x + w, y - h, 0), point3d(x, y - h, 0));
            dxf.addLine(point3d(x, y - h, 0), point3d(x, y, 0));
          }
          break;
          
        case 'circle':
          if (obj.left !== undefined && obj.top !== undefined && obj.radius !== undefined) {
            const centerX = obj.left + obj.radius;
            const centerY = -(obj.top + obj.radius); // Flip Y
            dxf.addCircle(point3d(centerX, centerY, 0), obj.radius);
          }
          break;
          
        case 'path':
          // Handle free-draw paths as polylines
          if (obj.path && Array.isArray(obj.path) && obj.path.length > 1) {
            for (let i = 0; i < obj.path.length - 1; i++) {
              const p1 = obj.path[i];
              const p2 = obj.path[i + 1];
              dxf.addLine(
                point3d(p1.x, -p1.y, 0),
                point3d(p2.x, -p2.y, 0)
              );
            }
          }
          break;
      }
    }
  }

  return dxf.stringify();
}

// Define entity types for dxf-parser
interface DxfEntity {
  type: string;
  vertices?: Array<{ x: number; y: number; z?: number }>;
  center?: { x: number; y: number; z?: number };
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  position?: { x: number; y: number; z?: number };
  colorIndex?: number;
  shape?: boolean;
}

interface ParsedDxf {
  entities?: DxfEntity[];
}

/**
 * Import DXF file and convert to canvas-compatible format
 */
export function importFromDXF(dxfContent: string): CanvasData {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfContent) as ParsedDxf;
  
  const objects: CanvasObject[] = [];
  
  if (dxf && dxf.entities) {
    for (const entity of dxf.entities) {
      switch (entity.type) {
        case 'LINE':
          if (entity.vertices && entity.vertices.length >= 2) {
            objects.push({
              type: 'line',
              x1: entity.vertices[0].x,
              y1: -entity.vertices[0].y, // Flip Y back
              x2: entity.vertices[1].x,
              y2: -entity.vertices[1].y,
              stroke: getColorFromACI(entity.colorIndex),
              strokeWidth: 2,
            });
          }
          break;
          
        case 'CIRCLE':
          if (entity.center && entity.radius) {
            objects.push({
              type: 'circle',
              left: entity.center.x - entity.radius,
              top: -entity.center.y - entity.radius, // Flip Y back
              radius: entity.radius,
              stroke: getColorFromACI(entity.colorIndex),
              strokeWidth: 2,
              fill: 'transparent',
            });
          }
          break;
          
        case 'ARC':
          // Convert arc to path points for approximation
          if (entity.center && entity.radius) {
            const centerX = entity.center.x;
            const centerY = -entity.center.y;
            const r = entity.radius;
            const startAngle = (entity.startAngle || 0) * (Math.PI / 180);
            const endAngle = (entity.endAngle || 360) * (Math.PI / 180);
            
            // Create arc as series of line segments
            const segments = 32;
            const angleStep = (endAngle - startAngle) / segments;
            
            for (let i = 0; i < segments; i++) {
              const a1 = startAngle + i * angleStep;
              const a2 = startAngle + (i + 1) * angleStep;
              
              objects.push({
                type: 'line',
                x1: centerX + r * Math.cos(a1),
                y1: centerY - r * Math.sin(a1),
                x2: centerX + r * Math.cos(a2),
                y2: centerY - r * Math.sin(a2),
                stroke: getColorFromACI(entity.colorIndex),
                strokeWidth: 2,
              });
            }
          }
          break;
          
        case 'LWPOLYLINE':
        case 'POLYLINE':
          if (entity.vertices && entity.vertices.length > 1) {
            for (let i = 0; i < entity.vertices.length - 1; i++) {
              objects.push({
                type: 'line',
                x1: entity.vertices[i].x,
                y1: -entity.vertices[i].y,
                x2: entity.vertices[i + 1].x,
                y2: -entity.vertices[i + 1].y,
                stroke: getColorFromACI(entity.colorIndex),
                strokeWidth: 2,
              });
            }
            // Close polyline if needed
            if (entity.shape) {
              const last = entity.vertices[entity.vertices.length - 1];
              const first = entity.vertices[0];
              objects.push({
                type: 'line',
                x1: last.x,
                y1: -last.y,
                x2: first.x,
                y2: -first.y,
                stroke: getColorFromACI(entity.colorIndex),
                strokeWidth: 2,
              });
            }
          }
          break;
          
        case 'POINT':
          // Represent points as small circles
          if (entity.position) {
            objects.push({
              type: 'circle',
              left: entity.position.x - 2,
              top: -entity.position.y - 2,
              radius: 2,
              stroke: getColorFromACI(entity.colorIndex),
              strokeWidth: 2,
              fill: getColorFromACI(entity.colorIndex),
            });
          }
          break;
      }
    }
  }
  
  return { objects };
}

/**
 * Convert AutoCAD Color Index (ACI) to hex color
 */
function getColorFromACI(colorIndex?: number): string {
  const aciColors: Record<number, string> = {
    1: '#FF0000',   // Red
    2: '#FFFF00',   // Yellow
    3: '#00FF00',   // Green
    4: '#00FFFF',   // Cyan
    5: '#0000FF',   // Blue
    6: '#FF00FF',   // Magenta
    7: '#000000',   // White/Black (default)
    8: '#808080',   // Gray
    9: '#C0C0C0',   // Light Gray
  };
  
  return aciColors[colorIndex || 7] || '#333333';
}
