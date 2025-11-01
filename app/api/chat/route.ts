import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { jobId, question, conversationHistory } = await request.json();

    if (!jobId || !question) {
      return NextResponse.json(
        { error: 'Missing jobId or question' },
        { status: 400 }
      );
    }

    // Fetch all results for this job
    const { data: results, error: resultsError } = await supabase
      .from('results')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 }
      );
    }

    if (!results || results.length === 0) {
      return NextResponse.json({
        answer: "I don't have any financial data to query yet. Please wait for the document processing to complete.",
      });
    }

    // Format the data for OpenAI
    const dataContext = results.map(r => ({
      document: r.doc_name,
      page: r.page,
      term: r.original_term,
      canonical: r.canonical,
      value: r.value,
      evidence: r.evidence,
    }));

    // Build conversation history for context
    const conversationContext = conversationHistory
      ?.map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n') || '';

    // Create prompt for OpenAI
    const prompt = `You are a helpful financial data assistant. You have access to extracted financial data from invoices and can answer questions about them.

Available Financial Data:
${JSON.stringify(dataContext, null, 2)}

Previous conversation:
${conversationContext}

User Question: ${question}

Instructions:
- Answer the user's question based ONLY on the available data
- Be specific and include exact values
- If asking for totals, sum up the relevant values
- If the data doesn't contain the answer, say so clearly
- Format numbers with proper currency notation
- Reference the source document and page when relevant
- Be concise but helpful

Answer:`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a financial data assistant that helps users query and understand their invoice data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const answer = completion.choices[0].message.content || 'I could not generate an answer.';

    // Store chat in database (optional - for history)
    await supabase.from('chat_history').insert({
      job_id: jobId,
      question,
      answer,
    }).catch(err => console.log('Note: chat_history table may not exist yet:', err.message));

    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

