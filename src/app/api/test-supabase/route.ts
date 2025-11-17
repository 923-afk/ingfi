import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test connection by checking if we can query
    const { error } = await supabase.from('jobs').select('count').limit(1);
    
    if (error) {
      // If table doesn't exist, that's okay - connection works
      if (error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          message: 'Supabase connected! (Tables not created yet - run the SQL schema)',
          connection: 'working'
        });
      }
      
      return NextResponse.json({ 
        success: false,
        error: error.message,
        code: error.code 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connected successfully!',
      connection: 'working',
      tables: 'ready'
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: 'Connection failed',
      details: error instanceof Error ? error.message : String(error),
      hint: 'Check your .env.local file has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }, { status: 500 });
  }
}

