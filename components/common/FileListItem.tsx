import { File, X } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface FileListItemProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}

export function FileListItem({ file, index, onRemove }: FileListItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 bg-zinc-200 rounded flex items-center justify-center shrink-0">
          <File className="w-4 h-4 text-zinc-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-zinc-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <Button
        onClick={() => onRemove(index)}
        variant="icon"
        className="p-1 shrink-0"
      >
        <X className="w-4 h-4 text-zinc-600" />
      </Button>
    </div>
  );
}

