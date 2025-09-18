import { supabase } from 'eventable/client.js'; // justera path om client.js inte ligger i src/

export async function GET() {
  const { data, error } = await supabase.from('test_table').select('*').limit(1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}