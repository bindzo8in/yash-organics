import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Now that we've removed the Edge middleware (proxy.ts), 
// auth.ts can safely use Node.js libraries like Prisma and Bcrypt.

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // 1. Find user in database
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;
          
          // 2. Check verification status
          if (!user.isVerified) {
            throw new Error("Email not verified");
          }

          // 3. Verify password
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
