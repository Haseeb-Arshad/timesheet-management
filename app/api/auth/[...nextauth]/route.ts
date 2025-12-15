import NextAuth, { NextAuthOptions, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Mock user for the dummy authentication
const MOCK_USER = {
    id: "1",
    name: "John Doe",
    email: "name@example.com",
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Dummy authentication logic: Accept any valid inputs, 
                // but specifically let's validate against the prompt's implied user or generic
                if (credentials?.email && credentials?.password) {
                    return MOCK_USER
                }
                return null
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // Simulate access/refresh token generation
            if (user) {
                token.id = user.id
                token.accessToken = "mock_access_token_" + Buffer.from(user.email || "").toString('base64')
                token.refreshToken = "mock_refresh_token_" + Date.now()
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                // Pass the mock tokens to the client session
                (session.user as any).id = token.id;
                (session.user as any).accessToken = token.accessToken;
            }
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "development-secret-key-change-me",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
