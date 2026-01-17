import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  variant: 'line' | 'box' | 'circle' | 'draw' | 'move' | 'delete';
  className?: string;
}

const variantStyles = {
  line: 'bg-tool-line text-tool-line-foreground hover:brightness-110 shadow-[0_4px_0_0_hsl(35,100%,35%)]',
  box: 'bg-tool-box text-tool-box-foreground hover:brightness-110 shadow-[0_4px_0_0_hsl(142,71%,30%)]',
  circle: 'bg-tool-circle text-tool-circle-foreground hover:brightness-110 shadow-[0_4px_0_0_hsl(211,100%,35%)]',
  draw: 'bg-tool-draw text-tool-draw-foreground hover:brightness-110 shadow-[0_4px_0_0_hsl(271,81%,40%)]',
  move: 'bg-tool-move text-tool-move-foreground hover:brightness-110 shadow-[0_4px_0_0_hsl(340,82%,45%)]',
  delete: 'bg-tool-delete text-tool-delete-foreground hover:brightness-110 shadow-[0_4px_0_0_hsl(0,84%,45%)]',
};

const activeRingColors = {
  line: 'ring-tool-line',
  box: 'ring-tool-box',
  circle: 'ring-tool-circle',
  draw: 'ring-tool-draw',
  move: 'ring-tool-move',
  delete: 'ring-tool-delete',
};

export function ToolButton({ icon: Icon, label, active, onClick, variant, className }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'tool-button min-w-[80px]',
        variantStyles[variant],
        active && `ring-4 ring-offset-2 ring-offset-background ${activeRingColors[variant]} scale-105`,
        className
      )}
    >
      <Icon className="w-6 h-6" strokeWidth={2.5} />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
