import { Minus, Square, Circle, Pencil, Move, Trash2 } from 'lucide-react';
import { ToolButton } from './ToolButton';
import type { Tool } from '@/types/canvas';

interface LeftToolbarProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
}

const tools: { tool: Tool; icon: typeof Minus; label: string; variant: 'line' | 'box' | 'circle' | 'draw' | 'move' | 'delete' }[] = [
  { tool: 'line', icon: Minus, label: 'Line', variant: 'line' },
  { tool: 'box', icon: Square, label: 'Box', variant: 'box' },
  { tool: 'circle', icon: Circle, label: 'Circle', variant: 'circle' },
  { tool: 'draw', icon: Pencil, label: 'Draw', variant: 'draw' },
  { tool: 'move', icon: Move, label: 'Move', variant: 'move' },
  { tool: 'delete', icon: Trash2, label: 'Delete', variant: 'delete' },
];

export function LeftToolbar({ selectedTool, onSelectTool }: LeftToolbarProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-gradient-to-r from-muted/30 to-transparent">
      {tools.map(({ tool, icon, label, variant }) => (
        <ToolButton
          key={tool}
          icon={icon}
          label={label}
          variant={variant}
          active={selectedTool === tool}
          onClick={() => onSelectTool(tool)}
        />
      ))}
    </div>
  );
}
