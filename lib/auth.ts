import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        const email =
          typeof credentials.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials.password === "string" ? credentials.password : "";

        if (!email || !password || !adminEmail || !adminPasswordHash) {
          return null;
        }

        if (email !== adminEmail) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password,
          adminPasswordHash
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: "admin",
          name: "Admin",
          email: adminEmail,
        };
      },
    }),
  ],
});

export default authConfig;
