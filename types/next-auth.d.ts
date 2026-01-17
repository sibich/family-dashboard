import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  // Extend the User object (used during sign-in)
  interface User {
    id: string
    role: string
  }

  // Extend the Session object (used in useSession / getServerSession)
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  // Extend the JWT object (used in the jwt callback)
  interface JWT {
    id: string
    role: string
  }
}