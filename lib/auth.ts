// lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

export async function getServerAuth() {
  return await getServerSession(authOptions);
}

export type { Session } from "next-auth";