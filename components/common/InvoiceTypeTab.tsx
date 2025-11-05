import React from 'react';
import { InvoiceType } from '@/lib/types';

interface InvoiceTypeTabProps {
  type: InvoiceType;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

export function InvoiceTypeTab({ type, label, icon, active, onClick }: InvoiceTypeTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
        active
          ? 'bg-zinc-900 text-white'
          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

