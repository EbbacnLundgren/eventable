import { StreamChat } from 'stream-chat';
import { getServerSession } from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';
import NextAuth from 'next-auth';
import { supabase } from '@/lib/client';
import { NextResponse } from 'next/server';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: gUser } = await supabase
    .from('google_users')
    .select('id, email')
    .eq('email', session.user.email)
    .single();

  if (!gUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY!,
    process.env.STREAM_API_SECRET!
  );

  const token = serverClient.createToken(gUser.id);

  return NextResponse.json({
    token,
    user: { id: gUser.id, name: gUser.email },
  });
}
