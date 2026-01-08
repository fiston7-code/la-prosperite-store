import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        { error: error.message, products: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      products: data || [],
      count: data?.length || 0 
    });

  } catch (err: any) {
    console.error('❌ Server error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur', products: [] },
      { status: 500 }
    );
  }
}
