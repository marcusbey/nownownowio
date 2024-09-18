"use client";

import { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import React, { createContext, useContext } from "react";

interface SessionContextType {
  session: Session | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContextType }>) {
  return (
    <NextAuthSessionProvider session={value.session}>
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    </NextAuthSessionProvider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
