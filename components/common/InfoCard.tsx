import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function InfoCard({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
}: InfoCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-zinc-200 overflow-hidden", className)}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            {title && <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>}
            {subtitle && (
              <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className={cn(contentClassName)}>
        {children}
      </div>
    </div>
  );
}

