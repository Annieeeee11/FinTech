import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only throw error when actually trying to use the client, not at module load
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  }
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Export a proxy that lazily creates the client on first property access
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    // If it's a function, bind it to the client
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Database types
export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  status: 'queued' | 'running' | 'done' | 'error';
  progress: number;
  documents_processed: number;
  total_records: number;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  job_id: string;
  doc_id: string;
  doc_name: string;
  page: number;
  original_term: string;
  canonical: string;
  value: string;
  confidence: number;
  evidence?: string;
  created_at: string;
}

export interface Synonym {
  id: string;
  term: string;
  canonical: string;
  created_at: string;
  updated_at: string;
}

