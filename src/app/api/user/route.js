import { supabase } from "@/lib/client"

export async function GET(req) {
  // Vi hämtar session från Supabase klienten
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "Ingen inloggad användare" }), { status: 401 })
  }

  return new Response(JSON.stringify({ user }), { status: 200 })
}
