import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface StatusIconProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
}

export function StatusIcon({ status }: StatusIconProps) {
  const icons = {
    idle: Clock,
    processing: Loader2,
    completed: CheckCircle,
    error: XCircle,
  };

  const Icon = icons[status];
  return (
    <Icon className={`w-6 h-6 ${status === 'processing' ? 'animate-spin' : ''}`} />
  );
}

