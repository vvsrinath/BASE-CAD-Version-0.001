import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  className?: string;
}

const variantStyles = {
  default: 'bg-card text-card-foreground border-2 border-border hover:bg-muted shadow-sm',
  primary: 'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_3px_0_0_hsl(211,100%,35%)]',
  success: 'bg-secondary text-secondary-foreground hover:brightness-110 shadow-[0_3px_0_0_hsl(142,71%,30%)]',
  warning: 'bg-accent text-accent-foreground hover:brightness-110 shadow-[0_3px_0_0_hsl(35,100%,35%)]',
};

export function ActionButton({ icon: Icon, label, onClick, disabled, variant = 'default', className }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200',
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:-translate-y-0.5 active:translate-y-0.5',
        className
      )}
    >
      <Icon className="w-4 h-4" strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}
