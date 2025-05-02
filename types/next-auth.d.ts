// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { AdapterUser } from "@auth/core/adapters";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null; // Add role to the session
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string | null; // Add role to the User type
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser extends AdapterUser {
    role?: string | null; // Add role to the AdapterUser type
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string | null; // Add role to the JWT
  }
}