'use client';

import React from 'react';
import { getStatusConfig } from '@/lib/utils';
import { InfoCard, StatusIcon, StatsCard } from '@/components/common';

interface JobStatusProps {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  documentsCount?: number;
  recordsCount?: number;
}

export default function JobStatus({ 
  status, 
  progress = 0, 
  message, 
  documentsCount = 0,
  recordsCount = 0 
}: JobStatusProps) {
  const config = getStatusConfig(status);

  return (
    <InfoCard title="Processing Status" className="h-93">
      <div className="p-6">
        <div className={`${config.bg} rounded-lg p-6`}>
          <div className="flex items-start gap-4">
            <div className={config.color}>
              <StatusIcon status={status} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-semibold ${config.color} mb-6`}>
                {config.label}
              </h3>
              <p className="text-sm text-zinc-600 mb-6">
                {message || config.description}
              </p>
            </div>
          </div>

          {status === 'processing' && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-600 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <StatsCard label="Documents" value={documentsCount} />
          <StatsCard label="Records" value={recordsCount} />
        </div>
      </div>
    </InfoCard>
  );
}
