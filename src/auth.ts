import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          if (
            process.env.ADMIN_EMAIL &&
            process.env.ADMIN_PASSWORD &&
            credentials.email === process.env.ADMIN_EMAIL &&
            credentials.password === process.env.ADMIN_PASSWORD
          ) {
              const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
              const seededUser = await prisma.user.upsert({
                where: { email: process.env.ADMIN_EMAIL },
                update: {},
                create: {
                  email: process.env.ADMIN_EMAIL,
                  password: hashedPassword,
                  role: "admin",
                  name: "Admin",
                }
              });
              return seededUser;
          }
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) return null
        
        return user
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login'
  }
})
