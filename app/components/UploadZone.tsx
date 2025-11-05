'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, Loader2, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFiles, uploadHandwrittenFiles } from '@/lib/api';
import { InvoiceType } from '@/lib/types';
import { validateFileType, pluralize } from '@/lib/utils';
import { FILE_TYPES } from '@/lib/constants';
import { InfoCard } from '@/components/common/InfoCard';
import { InvoiceTypeTab } from '@/components/common/InvoiceTypeTab';
import { FileListItem } from '@/components/common/FileListItem';

interface UploadZoneProps {
  onJobCreated: (jobId: string) => void;
}

export default function UploadZone({ onJobCreated }: UploadZoneProps) {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('regular');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragCounter = useRef(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter') {
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setDragActive(true);
      }
    } else if (e.type === 'dragleave') {
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setDragActive(false);
      }
    } else if (e.type === 'dragover') {
      e.preventDefault();
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setDragActive(true);
      }
    }
  }, []);

  const processFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (validateFileType(file, invoiceType)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} ${pluralize(validFiles.length, 'file')}`);
    }

    if (invalidFiles.length > 0) {
      const expectedTypes = invoiceType === 'regular' 
        ? FILE_TYPES.REGULAR.description
        : FILE_TYPES.HANDWRITTEN.description;
      toast.error(
        `${invalidFiles.length} ${pluralize(invalidFiles.length, 'file')} rejected. Only ${expectedTypes} are allowed.`,
        { duration: 4000 }
      );
    }
  }, [invoiceType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
      e.target.value = '';
    }
  };

  const handleProcess = async () => {
    if (uploadedFiles.length === 0) {
      toast.error(`Please upload at least one ${invoiceType === 'regular' ? 'PDF' : 'image or PDF'} file`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = invoiceType === 'handwritten' 
        ? await uploadHandwrittenFiles(uploadedFiles)
        : await uploadFiles(uploadedFiles);
      
      onJobCreated(response.jobId);
      toast.success(`Processing started! Job ID: ${response.jobId}`);
      setUploadedFiles([]);
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInvoiceTypeChange = (type: InvoiceType) => {
    setInvoiceType(type);
    setUploadedFiles([]);
  };

  const fileConfig = invoiceType === 'regular' ? FILE_TYPES.REGULAR : FILE_TYPES.HANDWRITTEN;

  return (
    <InfoCard
      title="Upload Documents"
      subtitle={
        <div className="space-y-3">
          <p>Upload invoices to extract and normalize financial data</p>
          <div className="flex gap-2">
            <InvoiceTypeTab
              type="regular"
              label="Regular Invoices"
              active={invoiceType === 'regular'}
              onClick={() => handleInvoiceTypeChange('regular')}
            />
            <InvoiceTypeTab
              type="handwritten"
              label="Handwritten Invoices"
              icon={<PenTool className="w-3 h-3" />}
              active={invoiceType === 'handwritten'}
              onClick={() => handleInvoiceTypeChange('handwritten')}
            />
          </div>
        </div>
      }
    >
      <div className="p-6">
        <div
          className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
              : 'border-zinc-300 hover:border-zinc-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept={fileConfig.accept}
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="py-12 px-6 text-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors ${
              dragActive ? 'bg-blue-100' : 'bg-zinc-100'
            }`}>
              {invoiceType === 'handwritten' ? (
                <PenTool className={`w-6 h-6 ${dragActive ? 'text-blue-600' : 'text-zinc-600'}`} />
              ) : (
                <Upload className={`w-6 h-6 ${dragActive ? 'text-blue-600' : 'text-zinc-600'}`} />
              )}
            </div>
            <p className={`text-sm font-medium mb-1 transition-colors ${
              dragActive ? 'text-blue-700' : 'text-zinc-900'
            }`}>
              {dragActive 
                ? 'Drop files here to upload'
                : invoiceType === 'handwritten' 
                  ? 'Drop handwritten invoices here or click to browse'
                  : 'Drop PDF files here or click to browse'
              }
            </p>
            <p className="text-xs text-zinc-500">
              {invoiceType === 'handwritten'
                ? 'Supports PDF, PNG, JPG images • Maximum 10MB per file • Uses Gemini AI for better handwriting recognition'
                : 'Support for multiple files • Maximum 10MB per file'}
            </p>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFiles.map((file, index) => (
              <FileListItem
                key={`${file.name}-${index}`}
                file={file}
                index={index}
                onRemove={removeFile}
              />
            ))}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className="mt-4 w-full px-4 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>Process {uploadedFiles.length} {pluralize(uploadedFiles.length, 'Document')}</>
            )}
          </button>
        )}
      </div>
    </InfoCard>
  );
}
