import { useEffect, useState, useRef } from 'react';
import { ResultRow } from '@/lib/api';

export function usePathwayStream(jobId: string | null) {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) {
      setResults([]);
      return;
    }

    const eventSource = new EventSource(`/api/pathway?jobId=${jobId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Transform database format to frontend format
        const transformResult = (result: any) => ({
          id: result.id,
          docId: result.doc_id || result.docId,
          docName: result.doc_name || result.docName,
          page: result.page,
          originalTerm: result.original_term || result.originalTerm,
          canonical: result.canonical,
          value: result.value,
          confidence: result.confidence,
          evidence: result.evidence,
        });
        
        if (Array.isArray(data)) {
          setResults(data.map(transformResult));
        } else {
          setResults(prev => [...prev, transformResult(data)]);
        }
      } catch (err) {
        console.error('Error parsing Pathway data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Pathway stream error:', err);
      setError('Stream connection error');
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [jobId]);

  return { results, error };
}

