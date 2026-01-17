import { Ruler } from 'lucide-react';

interface MeasurementDisplayProps {
  distance: number | null;
}

export function MeasurementDisplay({ distance }: MeasurementDisplayProps) {
  if (distance === null) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-full shadow-lg font-bold text-lg animate-in fade-in slide-in-from-bottom-4">
        <Ruler className="w-5 h-5" />
        <span>{distance} mm</span>
      </div>
    </div>
  );
}
