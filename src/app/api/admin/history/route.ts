import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      throw new Error('Supabase client not initialized. Check server logs for missing env vars.');
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('id, created_at, direction, text, contacts(wa_chat_id, lead_type, stage)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    // Tip: contacts is returned as an array or object depending on relationship.
    // We cast it to any to avoid complex type checks here for now.
    const items = (data || []).map((msg: any) => ({
      ...msg,
      contact: Array.isArray(msg.contacts) ? msg.contacts[0] : msg.contacts
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error('[History API GET] Error:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
