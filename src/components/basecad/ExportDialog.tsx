import { useState } from 'react';
import { Download, FileJson, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'json' | 'svg' | 'png') => void;
}

const exportOptions = [
  { format: 'json' as const, icon: FileJson, label: 'JSON', description: 'Save as project file' },
  { format: 'svg' as const, icon: FileText, label: 'SVG', description: 'Vector graphics' },
  { format: 'png' as const, icon: Download, label: 'PNG', description: 'Image file' },
];

export function ExportDialog({ open, onClose, onExport }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'svg' | 'png'>('json');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Export Drawing</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {exportOptions.map(({ format, icon: Icon, label, description }) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                selectedFormat === format
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className={cn(
                'p-3 rounded-xl',
                selectedFormat === format ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => onExport(selectedFormat)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-secondary text-secondary-foreground rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-[0_4px_0_0_hsl(142,71%,30%)] active:translate-y-1 active:shadow-none"
        >
          <Download className="w-5 h-5" />
          Download {selectedFormat.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
