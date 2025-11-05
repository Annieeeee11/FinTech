import { ReactNode } from 'react';
import { X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Drawer({ isOpen, onClose, children, className }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in",
        className
      )}>
        {children}
      </div>
    </>
  );
}

interface DrawerHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  onClose: () => void;
  className?: string;
}

export function DrawerHeader({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClose,
  className 
}: DrawerHeaderProps) {
  return (
    <div className={cn(
      "px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50",
      className
    )}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <Button
        onClick={onClose}
        variant="icon"
        className="p-2"
      >
        <X className="w-5 h-5 text-zinc-600" />
      </Button>
    </div>
  );
}

interface DrawerContentProps {
  children: ReactNode;
  className?: string;
}

export function DrawerContent({ children, className }: DrawerContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-6", className)}>
      {children}
    </div>
  );
}

interface DrawerFooterProps {
  onClose: () => void;
  actions?: ReactNode;
  className?: string;
}

export function DrawerFooter({ onClose, actions, className }: DrawerFooterProps) {
  return (
    <div className={cn(
      "px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between",
      className
    )}>
      {actions ? (
        <>
          <div>{actions}</div>
          <Button
            onClick={onClose}
            variant="primary"
            size="sm"
            className="rounded-lg"
          >
            Close
          </Button>
        </>
      ) : (
        <Button
          onClick={onClose}
          variant="primary"
          size="sm"
          className="ml-auto rounded-lg"
        >
          Close
        </Button>
      )}
    </div>
  );
}

