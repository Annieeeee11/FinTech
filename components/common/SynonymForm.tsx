import { Check, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { FormInput } from '@/components/common/FormInput';
import { Button } from '@/components/ui/Button';

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
        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="primary"
          size="xs"
          className="rounded flex items-center gap-1.5"
        >
          {isSaving ? <LoadingSpinner size="sm" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="xs"
          className="rounded flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

