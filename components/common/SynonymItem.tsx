import { Edit2, Trash2 } from 'lucide-react';
import { Synonym } from '@/lib/types';
import { IconButton } from '@/components/common/IconButton';

interface SynonymItemProps {
  synonym: Synonym;
  onEdit: (synonym: Synonym) => void;
  onDelete: (id: string) => void;
}

export function SynonymItem({ synonym, onEdit, onDelete }: SynonymItemProps) {
  return (
    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm font-medium text-zinc-900 min-w-[120px]">
            {synonym.term}
          </span>
          <span className="text-zinc-400">→</span>
          <span className="text-sm text-zinc-600">
            {synonym.canonical}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon={Edit2}
            size="sm"
            onClick={() => onEdit(synonym)}
            aria-label="Edit synonym"
          />
          <IconButton
            icon={Trash2}
            variant="danger"
            size="sm"
            onClick={() => onDelete(synonym.id)}
            aria-label="Delete synonym"
          />
        </div>
      </div>
    </div>
  );
}

