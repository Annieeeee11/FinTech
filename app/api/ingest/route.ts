import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Create a new job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        status: 'queued',
        progress: 0,
        documents_processed: 0,
        total_records: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Error creating job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Process each file
    const documentPromises = files.map(async (file) => {
      // For now, we'll store file metadata without actual file storage
      // In production, you'd upload to Supabase Storage
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: `/uploads/${job.id}/${file.name}`,
          file_size: file.size,
          status: 'uploaded',
        })
        .select()
        .single();

      if (docError) {
        console.error('Error creating document:', docError);
        return null;
      }

      return document;
    });

    const documents = await Promise.all(documentPromises);
    const validDocuments = documents.filter(Boolean);

    // Update job to running status
    await supabase
      .from('jobs')
      .update({ 
        status: 'running',
        message: `Processing ${validDocuments.length} documents...`
      })
      .eq('id', job.id);

    // Start background processing (in a real app, this would be a separate worker)
    processDocuments(job.id, validDocuments.map(d => d!.id));

    return NextResponse.json({
      jobId: job.id,
      status: 'queued',
    });

  } catch (error) {
    console.error('Ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}

// Background processing function (simulated)
async function processDocuments(jobId: string, documentIds: string[]) {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update job progress
    await supabase
      .from('jobs')
      .update({ progress: 30, message: 'Extracting text from PDFs...' })
      .eq('id', jobId);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get synonyms for mapping
    const { data: synonyms } = await supabase
      .from('synonyms')
      .select('*');

    const synonymMap = new Map(synonyms?.map(s => [s.term.toLowerCase(), s.canonical]) || []);

    // Generate mock results for each document
    const mockResults = [];
    for (const docId of documentIds) {
      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();

      if (!doc) continue;

      // Generate sample extracted data
      const sampleTerms = [
        { term: 'GST', value: '1200.00', page: 1, evidence: 'GST Amount: Rs. 1200.00' },
        { term: 'VAT', value: '850.50', page: 2, evidence: 'VAT: Rs. 850.50' },
        { term: 'Service Tax', value: '450.00', page: 1, evidence: 'Service Tax: Rs. 450.00' },
      ];

      for (const item of sampleTerms) {
        const canonical = synonymMap.get(item.term.toLowerCase()) || item.term;
        
        mockResults.push({
          job_id: jobId,
          doc_id: docId,
          doc_name: doc.name,
          page: item.page,
          original_term: item.term,
          canonical: canonical,
          value: item.value,
          confidence: Math.floor(Math.random() * 10) + 90, // 90-100%
          evidence: item.evidence,
        });
      }
    }

    await supabase
      .from('jobs')
      .update({ progress: 60, message: 'Normalizing extracted data...' })
      .eq('id', jobId);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Insert results
    if (mockResults.length > 0) {
      const { error: resultsError } = await supabase
        .from('results')
        .insert(mockResults);

      if (resultsError) {
        console.error('Error inserting results:', resultsError);
        throw resultsError;
      }
    }

    await supabase
      .from('jobs')
      .update({ progress: 90, message: 'Finalizing results...' })
      .eq('id', jobId);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mark job as done
    await supabase
      .from('jobs')
      .update({
        status: 'done',
        progress: 100,
        documents_processed: documentIds.length,
        total_records: mockResults.length,
        message: 'Processing completed successfully',
      })
      .eq('id', jobId);

  } catch (error) {
    console.error('Processing error:', error);
    await supabase
      .from('jobs')
      .update({
        status: 'error',
        message: 'Processing failed: ' + (error as Error).message,
      })
      .eq('id', jobId);
  }
}

