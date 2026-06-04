import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },

        role: {
          label: "Role",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.role
        ) {
          return null;
        }

        const { email, password, role } =
          credentials;

        let user = null;

        if (role === "student") {
          user =
            await prisma.student.findUnique({
              where: { email },
            });
        }

        if (role === "teacher") {
          user =
            await prisma.teacher.findUnique({
              where: { email },
            });
        }

        if (role === "admin") {
          user = await prisma.admin.findUnique({
            where: { email },
          });
        }

        if (!user) {
          return null;
        }

        const validPassword =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id =
          token.id;
        (session.user as any).role =
          token.role;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };