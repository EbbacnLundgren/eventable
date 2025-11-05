import { supabase } from '@/lib/client'

export async function POST(req: Request) {
  const { email, currentUserId } = await req.json()

  const { data, error } = await supabase
    .from('google_users')
    .select('id, email, first_name, last_name')
    .ilike('email', `%${email}%`)
    .neq('id', currentUserId) // inte visa sig själv

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    })
  }

  return new Response(JSON.stringify({ users: data }), { status: 200 })
}
