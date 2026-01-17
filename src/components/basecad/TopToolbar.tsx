import { Undo2, Redo2, FolderOpen, Download, Save } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { Logo } from './Logo';

interface TopToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
}

export function TopToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpen,
  onSave,
  onExport,
}: TopToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/50">
      <Logo size="md" />
      
      <div className="flex items-center gap-2">
        <ActionButton 
          icon={Undo2} 
          label="Undo" 
          onClick={onUndo} 
          disabled={!canUndo}
        />
        <ActionButton 
          icon={Redo2} 
          label="Redo" 
          onClick={onRedo} 
          disabled={!canRedo}
        />
        <div className="w-px h-8 bg-border mx-2" />
        <ActionButton 
          icon={FolderOpen} 
          label="Open Drawing" 
          onClick={onOpen}
        />
        <ActionButton 
          icon={Save} 
          label="Save" 
          onClick={onSave}
          variant="primary"
        />
        <ActionButton 
          icon={Download} 
          label="Export" 
          onClick={onExport}
          variant="success"
        />
      </div>
    </div>
  );
}
