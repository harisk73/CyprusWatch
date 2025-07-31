import { ExpressAuth } from "@auth/express"
import Google from "@auth/express/providers/google"
import GitHub from "@auth/express/providers/github"
import Credentials from "@auth/express/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"
import bcrypt from "bcryptjs"
import { users } from "@shared/schema"
import { eq } from "drizzle-orm"
import type { Express } from "express"

// Configure Auth.js with multiple providers
export const authConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // GitHub OAuth  
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // Email/Password authentication
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1)

        if (!user.length || !user[0].passwordHash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user[0].passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user[0].id,
          email: user[0].email,
          name: `${user[0].firstName} ${user[0].lastName}`,
          image: user[0].profileImageUrl,
        }
      }
    })
  ],
  session: {
    strategy: "database" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async session({ session, user }) {
      // Add custom user data to session
      if (session.user && user) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email!))
          .limit(1)

        if (dbUser.length > 0) {
          session.user.id = user.id
          session.user.isVillageAdmin = dbUser[0].isVillageAdmin
          session.user.isSystemAdmin = dbUser[0].isSystemAdmin
          session.user.villageId = dbUser[0].villageId
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign in
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1)

        if (existingUser.length === 0) {
          // Create new user for OAuth providers
          await db.insert(users).values({
            email: user.email!,
            firstName: profile?.given_name || user.name?.split(' ')[0] || '',
            lastName: profile?.family_name || user.name?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: user.image || null,
          })
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  }
}

export function setupAuth(app: Express) {
  // Configure express session handling
  app.use("/auth/*", ExpressAuth(authConfig))
  
  console.log("Auth.js authentication enabled with providers:")
  console.log("- Google OAuth:", !!process.env.GOOGLE_CLIENT_ID)
  console.log("- GitHub OAuth:", !!process.env.GITHUB_CLIENT_ID) 
  console.log("- Email/Password: enabled")
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.auth?.user) {
    return next()
  }
  
  res.status(401).json({ 
    error: "Unauthorized", 
    message: "Please sign in to access this resource" 
  })
}

// Middleware to check if user is admin
export const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.auth?.user) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, req.auth.user.email))
    .limit(1)

  if (!user.length || (!user[0].isSystemAdmin && !user[0].isVillageAdmin)) {
    return res.status(403).json({ error: "Forbidden" })
  }

  next()
}