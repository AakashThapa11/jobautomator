"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export default function CustomSessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session & { expires: string } | null;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}