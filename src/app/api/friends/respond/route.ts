// to accept or deny an invite
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/client'

export async function POST(req: Request) {
  const { requestId, action } = await req.json()

  if (!requestId || !['accepted', 'declined'].includes(action)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { error } = await supabase
    .from('friendships')
    .update({ status: action })
    .eq('id', requestId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: `Request ${action}` }, { status: 200 })
}
