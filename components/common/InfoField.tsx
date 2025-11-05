import { ReactNode } from 'react';

interface InfoFieldProps {
  label: string;
  children: ReactNode;
}

export function InfoField({ label, children }: InfoFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

