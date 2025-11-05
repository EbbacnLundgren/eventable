import { supabase } from '@/lib/client'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { requesterId, receiverId } = await req.json()
  if (!requesterId || !receiverId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('friendships')
    .select('*')
    .or(
      `and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`
    )
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { message: 'Friend request already exists' },
      { status: 200 }
    )
  }

  const { error } = await supabase
    .from('friendships')
    .insert([
      { requester_id: requesterId, receiver_id: receiverId, status: 'pending' },
    ])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  //return new Response(JSON.stringify({ success: true }), { status: 200 })
  return NextResponse.json({ message: 'Request sent' }, { status: 200 })
}
