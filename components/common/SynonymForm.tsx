import { Check, X } from 'lucide-react';
import { LoadingSpinner, FormInput } from '@/components/common';

interface SynonymFormProps {
  term: string;
  canonical: string;
  onTermChange: (value: string) => void;
  onCanonicalChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function SynonymForm({
  term,
  canonical,
  onTermChange,
  onCanonicalChange,
  onSave,
  onCancel,
  isSaving,
}: SynonymFormProps) {
  return (
    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <FormInput
          label="Original Term"
          placeholder="e.g., VAT"
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
        />
        <FormInput
          label="Canonical Field"
          placeholder="e.g., Goods & Services Tax"
          value={canonical}
          onChange={(e) => onCanonicalChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-medium rounded hover:bg-zinc-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <LoadingSpinner size="sm" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-white text-zinc-700 text-xs font-medium border border-zinc-300 rounded hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

