'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { getDocumentHistory } from '@/lib/api';
import { DocumentHistoryItem } from '@/lib/types';
import { formatDate, formatFileSize, pluralize } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FileIcon } from '@/components/common/FileIcon';
import { InfoCard } from '@/components/common/InfoCard';
import { Button } from '@/components/ui/Button';

interface DocumentHistoryProps {
  onDocumentSelect?: (jobId: string) => void;
}

export default function DocumentHistory({ onDocumentSelect }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<DocumentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setIsLoading(true);
    setError(null);
    try {
      const history = await getDocumentHistory();
      setDocuments(history);
    } catch (err) {
      setError('Failed to load document history');
      console.error('Error fetching document history:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const displayedDocuments = showAll ? documents : documents.slice(0, 3);

  return (
    <InfoCard
      title="Document History"
      subtitle="Recently processed documents"
      actions={
        documents.length > 3 && (
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="text"
            size="xs"
          >
            {showAll ? 'Show Less' : `Show All (${documents.length})`}
          </Button>
        )
      }
      contentClassName={`overflow-y-auto ${showAll ? 'max-h-[400px]' : ''}`}
    >
      {isLoading ? (
        <div className="px-6 py-12">
          <LoadingSpinner text="Loading history..." />
        </div>
      ) : error ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Upload your first document to get started"
        />
      ) : (
        <div className="divide-y divide-zinc-200">
          {displayedDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => doc.jobId && onDocumentSelect?.(doc.jobId)}
              className={`px-6 py-4 hover:bg-zinc-50 transition-colors ${
                doc.jobId && onDocumentSelect ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <FileIcon />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(doc.uploadDate)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatFileSize(doc.fileSize)}
                    </span>
                    {doc.recordsCount > 0 && (
                      <span className="text-xs text-zinc-500">
                        {doc.recordsCount} {pluralize(doc.recordsCount, 'record')}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={doc.jobStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </InfoCard>
  );
}
