import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from '@/lib/client'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Logga in med Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error || !data.user) return null

        // Lägg till användare i google_users om den inte finns
        const { data: existing } = await supabase
          .from('google_users')
          .select('id')
          .eq('email', data.user.email)
          .single()

        if (!existing) {
          await supabase.from('google_users').insert({
            email: data.user.email,
            first_name: '',
            last_name: '',
            avatar_url: '',
            created_at: new Date().toISOString(),
            phone_nbr: '',
          })
        }

        return { id: data.user.id, email: data.user.email }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return baseUrl + url
      if (new URL(url).origin === baseUrl) return url
      return baseUrl + '/main'
    },
  },
})
