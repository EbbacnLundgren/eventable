// hämtar alla pedning förfrågningar
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/client'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('friendships')
    .select(
      'id, requester_id, status, google_users!friendships_requester_id_fkey(id, email, first_name, last_name)'
    )
    .eq('receiver_id', userId)
    .eq('status', 'pending')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ requests: data }, { status: 200 })
}
