import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/db';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[Settings API] Env check:', {
      url: supabaseUrl ? 'Exists' : 'Missing',
      key: supabaseKey ? 'Exists' : 'Missing'
    });

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Settings API] Missing env vars');
      return NextResponse.json(
        { error: "Supabase env vars are missing" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase
      .from('settings')
      .select('key,value')
      .in('key', ['system_prompt', 'site_url', 'candidate_link', 'agency_link', 'tone']);

    if (error) {
      console.error('[Settings API] Supabase error:', error);
      throw new Error(error.message);
    }

    const map: Record<string, string> = {};
    for (const row of data || []) map[row.key] = row.value;

    return NextResponse.json({
      system_prompt: map.system_prompt || '',
      site_url: map.site_url || '',
      candidate_link: map.candidate_link || '',
      agency_link: map.agency_link || '',
      tone: map.tone || '',
    });
  } catch (e: any) {
    console.error('[Settings API GET] Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database connection unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const upserts = [
      ['system_prompt', String(body.system_prompt || '')],
      ['site_url', String(body.site_url || '')],
      ['candidate_link', String(body.candidate_link || '')],
      ['agency_link', String(body.agency_link || '')],
      ['tone', String(body.tone || '')],
    ].map(([key, value]) => ({ key, value }));

    const { error } = await supabaseAdmin.from('settings').upsert(upserts, { onConflict: 'key' });
    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[Settings API POST] Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
