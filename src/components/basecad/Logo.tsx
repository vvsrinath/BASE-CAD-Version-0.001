import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizes[size])}>
        {/* 3D Cube Logo */}
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">
          {/* Blue face (front) */}
          <polygon 
            points="5,25 20,35 20,15 5,5" 
            fill="hsl(211, 100%, 50%)" 
          />
          {/* Yellow face (right) */}
          <polygon 
            points="20,35 35,25 35,5 20,15" 
            fill="hsl(45, 100%, 50%)" 
          />
          {/* Red/Orange face (top) */}
          <polygon 
            points="5,5 20,15 35,5 20,-5" 
            fill="hsl(15, 100%, 55%)" 
          />
        </svg>
      </div>
      <span className={cn('font-extrabold tracking-tight', textSizes[size])}>
        <span className="text-primary">BASE</span>
        <span className="text-secondary">CAD</span>
      </span>
    </div>
  );
}
