import { useState, useCallback } from 'react';

export interface UseCanvasHistoryReturn {
  history: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  pushState: (state: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clear: () => void;
}

export function useCanvasHistory(maxHistory = 50): UseCanvasHistoryReturn {
  const [history, setHistory] = useState<string[]>(['{}']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushState = useCallback((state: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [historyIndex, maxHistory]);

  const undo = useCallback(() => {
    if (!canUndo) return null;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return history[newIndex];
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (!canRedo) return null;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    return history[newIndex];
  }, [canRedo, history, historyIndex]);

  const clear = useCallback(() => {
    setHistory(['{}']);
    setHistoryIndex(0);
  }, []);

  return {
    history,
    historyIndex,
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    clear,
  };
}
