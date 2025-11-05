import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentCount: number;
  totalCount: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function Pagination({
  currentCount,
  totalCount,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: PaginationProps) {
  return (
    <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between">
      <p className="text-xs text-zinc-500">
        Showing {currentCount} of {totalCount} results
      </p>
      <div className="flex items-center gap-2">
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          variant="ghost"
          size="xs"
          className="rounded"
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasNext}
          variant="ghost"
          size="xs"
          className="rounded"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

