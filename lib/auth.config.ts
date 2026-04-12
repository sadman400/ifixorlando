import { type NextAuthConfig } from "next-auth";

const authConfig = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
