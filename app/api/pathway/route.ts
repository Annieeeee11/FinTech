import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Real-time data streaming via Supabase (Pathway equivalent)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  // Stream results in real-time using Supabase subscriptions
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial data
      const { data: initialData } = await supabase
        .from('results')
        .select('*')
        .eq('job_id', jobId);
      
      if (initialData) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
      }

      // Subscribe to real-time changes
      const channel = supabase
        .channel(`results-${jobId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'results',
            filter: `job_id=eq.${jobId}`
          },
          (payload) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload.new)}\n\n`));
          }
        )
        .subscribe();

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        supabase.removeChannel(channel);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

