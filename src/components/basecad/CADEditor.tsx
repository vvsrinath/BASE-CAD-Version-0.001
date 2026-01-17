import { useState, useCallback, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';
import { TopToolbar } from './TopToolbar';
import { LeftToolbar } from './LeftToolbar';
import { BottomToolbar } from './BottomToolbar';
import { DrawingCanvas } from './DrawingCanvas';
import { ExportDialog } from './ExportDialog';
import { MeasurementDisplay } from './MeasurementDisplay';
import { useCanvasHistory } from '@/hooks/useCanvasHistory';
import { useToast } from '@/hooks/use-toast';
import type { Tool } from '@/types/canvas';

const STORAGE_KEY = 'basecad-drawing';

export function CADEditor() {
  const [selectedTool, setSelectedTool] = useState<Tool>('line');
  const [gridEnabled, setGridEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [measureMode, setMeasureMode] = useState(false);
  const [measurement, setMeasurement] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [undoState, setUndoState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    clear,
  } = useCanvasHistory();

  // Auto-save to localStorage
  const handleStateChange = useCallback((state: string) => {
    pushState(state);
    localStorage.setItem(STORAGE_KEY, state);
  }, [pushState]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setUndoState(saved);
      pushState(saved);
    }
  }, [pushState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setUndoState(state);
      localStorage.setItem(STORAGE_KEY, state);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setUndoState(state);
      localStorage.setItem(STORAGE_KEY, state);
    }
  }, [redo]);

  const handleOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        JSON.parse(content); // Validate JSON
        setUndoState(content);
        pushState(content);
        localStorage.setItem(STORAGE_KEY, content);
        toast({
          title: '✅ Drawing loaded!',
          description: 'Your drawing has been opened successfully.',
        });
      } catch {
        toast({
          title: '❌ Invalid file',
          description: 'Please select a valid BASECAD JSON file.',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [pushState, toast]);

  const handleSave = useCallback(() => {
    const state = localStorage.getItem(STORAGE_KEY) || '{}';
    const blob = new Blob([state], { type: 'application/json' });
    saveAs(blob, 'drawing.basecad.json');
    toast({
      title: '💾 Saved!',
      description: 'Your drawing has been downloaded.',
    });
  }, [toast]);

  const handleExport = useCallback((format: 'json' | 'svg' | 'png') => {
    const state = localStorage.getItem(STORAGE_KEY) || '{}';
    
    if (format === 'json') {
      const blob = new Blob([state], { type: 'application/json' });
      saveAs(blob, 'drawing.json');
    } else if (format === 'svg') {
      // Create basic SVG from canvas data
      try {
        const data = JSON.parse(state);
        const svgContent = generateSVG(data);
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        saveAs(blob, 'drawing.svg');
      } catch {
        toast({
          title: '❌ Export failed',
          description: 'Could not export to SVG.',
          variant: 'destructive',
        });
        return;
      }
    } else if (format === 'png') {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) saveAs(blob, 'drawing.png');
        });
      }
    }
    
    setShowExport(false);
    toast({
      title: '📥 Exported!',
      description: `Your drawing has been exported as ${format.toUpperCase()}.`,
    });
  }, [toast]);

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(z + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(z - 0.1, 0.25));
  }, []);

  const handleToggleMeasure = useCallback(() => {
    setMeasureMode(m => !m);
  }, []);

  const handleToggleGrid = useCallback(() => {
    setGridEnabled(g => !g);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpen={handleOpen}
        onSave={handleSave}
        onExport={() => setShowExport(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
        />

        <DrawingCanvas
          selectedTool={selectedTool}
          gridEnabled={gridEnabled}
          zoom={zoom}
          measureMode={measureMode}
          onStateChange={handleStateChange}
          undoState={undoState}
          onMeasurement={setMeasurement}
        />
      </div>

      <BottomToolbar
        zoom={zoom}
        gridEnabled={gridEnabled}
        measureMode={measureMode}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleMeasure={handleToggleMeasure}
        onToggleGrid={handleToggleGrid}
      />

      <MeasurementDisplay distance={measurement} />

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        onExport={handleExport}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.basecad.json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

function generateSVG(data: Record<string, unknown>): string {
  let svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">';
  
  if (data.objects && Array.isArray(data.objects)) {
    for (const obj of data.objects) {
      switch (obj.type) {
        case 'line':
          svgContent += `<line x1="${obj.x1}" y1="${obj.y1}" x2="${obj.x2}" y2="${obj.y2}" stroke="${obj.stroke || '#333'}" stroke-width="${obj.strokeWidth || 2}"/>`;
          break;
        case 'rect':
          svgContent += `<rect x="${obj.left}" y="${obj.top}" width="${obj.width}" height="${obj.height}" stroke="${obj.stroke || '#333'}" stroke-width="${obj.strokeWidth || 2}" fill="${obj.fill || 'none'}"/>`;
          break;
        case 'circle':
          svgContent += `<circle cx="${(obj.left || 0) + (obj.radius || 0)}" cy="${(obj.top || 0) + (obj.radius || 0)}" r="${obj.radius || 0}" stroke="${obj.stroke || '#333'}" stroke-width="${obj.strokeWidth || 2}" fill="${obj.fill || 'none'}"/>`;
          break;
      }
    }
  }
  
  svgContent += '</svg>';
  return svgContent;
}
