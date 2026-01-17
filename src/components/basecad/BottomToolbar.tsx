import { ZoomIn, ZoomOut, Ruler, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomToolbarProps {
  zoom: number;
  gridEnabled: boolean;
  measureMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleMeasure: () => void;
  onToggleGrid: () => void;
}

interface BottomButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant: 'blue' | 'green';
}

function BottomButton({ icon: Icon, label, onClick, active, variant }: BottomButtonProps) {
  const styles = {
    blue: 'bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-[0_4px_0_0_hsl(211,100%,30%)]',
    green: 'bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground shadow-[0_4px_0_0_hsl(142,71%,25%)]',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200',
        styles[variant],
        active && 'ring-4 ring-offset-2 ring-offset-background ring-current',
        'hover:-translate-y-0.5 active:translate-y-1'
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

export function BottomToolbar({
  zoom,
  gridEnabled,
  measureMode,
  onZoomIn,
  onZoomOut,
  onToggleMeasure,
  onToggleGrid,
}: BottomToolbarProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-t from-muted/50 to-transparent">
      <BottomButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} variant="blue" />
      <BottomButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} variant="blue" />
      <div className="px-3 py-1 bg-card rounded-full font-bold text-sm border-2 border-border">
        {Math.round(zoom * 100)}%
      </div>
      <BottomButton icon={Ruler} label="Measure" onClick={onToggleMeasure} active={measureMode} variant="green" />
      <BottomButton 
        icon={Grid3X3} 
        label={gridEnabled ? 'Grid On' : 'Grid Off'} 
        onClick={onToggleGrid} 
        active={gridEnabled}
        variant="green" 
      />
    </div>
  );
}
