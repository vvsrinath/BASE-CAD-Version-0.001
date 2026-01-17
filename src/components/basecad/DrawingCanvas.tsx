import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Line, Rect, Circle, PencilBrush, FabricObject, TPointerEventInfo, TPointerEvent } from 'fabric';
import type { Tool } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface DrawingCanvasProps {
  selectedTool: Tool;
  gridEnabled: boolean;
  zoom: number;
  measureMode: boolean;
  onStateChange: (state: string) => void;
  undoState: string | null;
  onMeasurement: (distance: number | null) => void;
}

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function DrawingCanvas({
  selectedTool,
  gridEnabled,
  zoom,
  measureMode,
  onStateChange,
  undoState,
  onMeasurement,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasObjects, setHasObjects] = useState(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<FabricObject | null>(null);
  const measureStartRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new Canvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: 'transparent',
      selection: selectedTool === 'move',
    });

    fabricRef.current = canvas;

    const handleResize = () => {
      canvas.setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
      canvas.renderAll();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
    };
  }, []);

  // Handle zoom
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom]);

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === 'draw';
    canvas.selection = selectedTool === 'move';

    if (selectedTool === 'draw') {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 3;
      canvas.freeDrawingBrush.color = '#333333';
    }

    // Update cursor
    const cursors: Record<Tool, string> = {
      line: 'crosshair',
      box: 'crosshair',
      circle: 'crosshair',
      draw: 'crosshair',
      move: 'move',
      delete: 'pointer',
      measure: 'crosshair',
      select: 'default',
    };
    canvas.defaultCursor = cursors[selectedTool];
    canvas.hoverCursor = selectedTool === 'delete' ? 'not-allowed' : cursors[selectedTool];
  }, [selectedTool]);

  // Handle undo state restoration
  useEffect(() => {
    if (!undoState || !fabricRef.current) return;
    const canvas = fabricRef.current;
    
    try {
      const objects = JSON.parse(undoState);
      canvas.clear();
      if (objects.objects) {
        canvas.loadFromJSON(objects, () => {
          canvas.renderAll();
        });
      }
    } catch {
      // Invalid state, ignore
    }
  }, [undoState]);

  const saveState = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    onStateChange(json);
    setHasObjects(canvas.getObjects().length > 0);
  }, [onStateChange]);

  // Mouse event handlers
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (selectedTool === 'draw' || selectedTool === 'move') return;

      const pointer = canvas.getPointer(opt.e);
      let x = pointer.x;
      let y = pointer.y;

      if (gridEnabled && selectedTool !== 'delete') {
        x = snapToGrid(x, GRID_SIZE);
        y = snapToGrid(y, GRID_SIZE);
      }

      if (measureMode) {
        measureStartRef.current = { x, y };
        return;
      }

      if (selectedTool === 'delete') {
        const target = canvas.findTarget(opt.e);
        if (target) {
          canvas.remove(target);
          saveState();
        }
        return;
      }

      setIsDrawing(true);
      startPointRef.current = { x, y };

      let shape: FabricObject | null = null;

      switch (selectedTool) {
        case 'line':
          shape = new Line([x, y, x, y], {
            stroke: '#333333',
            strokeWidth: 3,
            selectable: true,
            hasControls: true,
          });
          break;
        case 'box':
          shape = new Rect({
            left: x,
            top: y,
            width: 0,
            height: 0,
            stroke: '#333333',
            strokeWidth: 3,
            fill: 'transparent',
            selectable: true,
            hasControls: true,
          });
          break;
        case 'circle':
          shape = new Circle({
            left: x,
            top: y,
            radius: 0,
            stroke: '#333333',
            strokeWidth: 3,
            fill: 'transparent',
            selectable: true,
            hasControls: true,
          });
          break;
      }

      if (shape) {
        canvas.add(shape);
        currentShapeRef.current = shape;
      }
    };

    const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const pointer = canvas.getPointer(opt.e);
      let x = pointer.x;
      let y = pointer.y;

      if (gridEnabled) {
        x = snapToGrid(x, GRID_SIZE);
        y = snapToGrid(y, GRID_SIZE);
      }

      // Measure mode
      if (measureMode && measureStartRef.current) {
        const dx = x - measureStartRef.current.x;
        const dy = y - measureStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        onMeasurement(Math.round(distance));
        return;
      }

      if (!isDrawing || !startPointRef.current || !currentShapeRef.current) return;

      const start = startPointRef.current;
      const shape = currentShapeRef.current;

      switch (selectedTool) {
        case 'line':
          if (shape instanceof Line) {
            shape.set({ x2: x, y2: y });
          }
          break;
        case 'box':
          if (shape instanceof Rect) {
            const width = Math.abs(x - start.x);
            const height = Math.abs(y - start.y);
            shape.set({
              left: Math.min(start.x, x),
              top: Math.min(start.y, y),
              width,
              height,
            });
          }
          break;
        case 'circle':
          if (shape instanceof Circle) {
            const radius = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
            shape.set({ radius });
          }
          break;
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (measureMode) {
        measureStartRef.current = null;
        onMeasurement(null);
        return;
      }

      if (isDrawing) {
        setIsDrawing(false);
        startPointRef.current = null;
        currentShapeRef.current = null;
        saveState();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('object:modified', saveState);
    canvas.on('path:created', saveState);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('object:modified', saveState);
      canvas.off('path:created', saveState);
    };
  }, [selectedTool, gridEnabled, isDrawing, measureMode, saveState, onMeasurement]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex-1 relative overflow-hidden rounded-xl m-4 shadow-inner',
        'bg-canvas-bg',
        gridEnabled && 'canvas-grid'
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Empty state - only show when no objects */}
      {!hasObjects && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4">✏️</div>
            <p className="text-xl font-bold text-muted-foreground animate-bounce">
              Pick a tool on the left and start drawing!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
