import { supabase } from '@/lib/client'

export async function POST(req: Request) {
  const { requesterId, receiverId } = await req.json()

  const { error } = await supabase
    .from('friendships')
    .insert([
      { requester_id: requesterId, receiver_id: receiverId, status: 'pending' },
    ])

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
