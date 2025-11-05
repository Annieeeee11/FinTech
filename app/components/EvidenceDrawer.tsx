'use client';

import { FileText, MapPin } from 'lucide-react';
import { Evidence } from '@/lib/types';
import { ConfidenceBadge } from '@/components/common/ConfidenceBadge';
import { InfoField } from '@/components/common/InfoField';
import { InfoCard } from '@/components/common/InfoCard';
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from '@/components/common/Drawer';

interface EvidenceDrawerProps {
  evidence: Evidence;
  onClose: () => void;
}

export default function EvidenceDrawer({ evidence, onClose }: EvidenceDrawerProps) {
  const evidenceSnippet = evidence.evidence || 
    `Invoice Total: Rs. 15,000
${evidence.originalTerm}: Rs. ${evidence.value}
Net Amount: Rs. 13,800

Terms and Conditions:
Payment due within 30 days of invoice date.`;

  return (
    <Drawer isOpen={true} onClose={onClose}>
      <DrawerHeader
        icon={FileText}
        title="Evidence Details"
        subtitle="Source document and extracted snippet"
        onClose={onClose}
      />

      <DrawerContent>
        <InfoCard contentClassName="p-6" className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Document">
              <p className="text-sm font-medium text-zinc-900">{evidence.docName}</p>
            </InfoField>
            <InfoField label="Page Number">
              <p className="text-sm font-medium text-zinc-900">Page {evidence.page}</p>
            </InfoField>
            <InfoField label="Original Term">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-zinc-200 text-sm font-medium text-zinc-800">
                {evidence.originalTerm}
              </span>
            </InfoField>
            <InfoField label="Confidence Score">
              <ConfidenceBadge confidence={evidence.confidence} />
            </InfoField>
          </div>
        </InfoCard>

        <InfoCard 
          title="Field Mapping"
          subtitle="Original term mapped to canonical field"
          className="mb-6"
          contentClassName="p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-1">Original Term</p>
              <p className="text-base font-semibold text-zinc-900">{evidence.originalTerm}</p>
            </div>
            {/* <div className="shrink-0">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div> */}
            <div className="flex-1">
              <p className="text-xs text-zinc-500 mb-1">Canonical Field</p>
              <p className="text-base font-semibold text-zinc-900">{evidence.canonical}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-300">
            <p className="text-xs text-zinc-500 mb-1">Extracted Value</p>
            <p className="text-xl font-mono font-bold text-zinc-900">Rs.{evidence.value}</p>
          </div>
        </InfoCard>

        <InfoCard 
          title="Source Text Snippet"
          subtitle={
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span>Exact location in the document</span>
            </div>
          }
        >
          <div className="px-6 py-4">
            <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
              <pre className="text-sm text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">
                {evidenceSnippet}
              </pre>
            </div>
            <p className="text-xs text-zinc-500 mt-3 flex items-start gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-zinc-400 rounded-full mt-1.5"></span>
              <span>
                This snippet shows the exact location where the term "{evidence.originalTerm}" was
                found in the original document. The extraction algorithm identified this with{' '}
                {evidence.confidence}% confidence.
              </span>
            </p>
          </div>
        </InfoCard>
      </DrawerContent>
      <DrawerFooter 
        onClose={onClose}
      />
    </Drawer>
  );
}
