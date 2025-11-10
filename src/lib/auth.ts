import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@auth/supabase-adapter'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, ''), // Remove trailing slash
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      console.log('SignIn callback:', { userId: user.id, email: user.email })
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      
      // If url is a relative path, prepend baseUrl
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`
        console.log('Redirecting to:', redirectUrl)
        return redirectUrl
      }
      
      // If url is on the same origin, allow it
      try {
        const urlObj = new URL(url)
        if (urlObj.origin === baseUrl) {
          console.log('Redirecting to same origin:', url)
          return url
        }
      } catch (e) {
        // Invalid URL, fallback to dashboard
        console.log('Invalid URL, redirecting to dashboard')
        return `${baseUrl}/dashboard`
      }
      
      // Default to dashboard if no valid URL
      console.log('Redirecting to dashboard:', `${baseUrl}/dashboard`)
      return `${baseUrl}/dashboard`
    },
    async session({ session, token, user }) {
      console.log('Session callback:', { token, user, email: session.user?.email })
      if (session.user) {
        // With JWT strategy, user id comes from token
        // With database strategy, user id comes from user object
        session.user.id = (token?.sub as string) || (user?.id as string) || ''
      }
      return session
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth account and user id to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
}
