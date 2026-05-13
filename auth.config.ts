import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");
      
      if (isOnAdmin) {
        if (isLoggedIn) {
          const role = (auth.user as any).role;
          return role === "ADMIN" || role === "SUPER_ADMIN";
        }
        return false; // Redirect unauthenticated or non-admin users to login page
      }

      if (isOnProfile || isOnCheckout) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
