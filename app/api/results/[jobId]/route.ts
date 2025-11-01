import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 }
      );
    }

    // Transform to match frontend interface
    const transformedResults = results?.map(result => ({
      id: result.id,
      docId: result.doc_id,
      docName: result.doc_name,
      page: result.page,
      originalTerm: result.original_term,
      canonical: result.canonical,
      value: result.value,
      confidence: result.confidence,
      evidence: result.evidence,
    })) || [];

    return NextResponse.json(transformedResults);

  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

