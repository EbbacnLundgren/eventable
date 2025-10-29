import { StreamChat } from 'stream-chat'
import { supabase } from '@/lib/client'

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
)

export async function POST(req: Request) {
  try {
    const { supabaseUserId } = await req.json()
    if (!supabaseUserId) return new Response(JSON.stringify({ error: 'Missing user id' }), { status: 400 })

    const { data: gUser } = await supabase
      .from('google_users')
      .select('id, email')
      .eq('id', supabaseUserId)
      .single()

    if (!gUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })

    const token = serverClient.createToken(gUser.id)

    return new Response(JSON.stringify({ token, user: { id: gUser.id, name: gUser.email } }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err }), { status: 500 })
  }
}
