"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";
import { userDocRef, onSnapshot } from "@/lib/firebase/firestore";
import type { UserDoc } from "@/lib/types/alumni.types";

interface AuthContextValue {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userDoc: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserDoc(null);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubDoc = onSnapshot(userDocRef(user.uid), async (snap) => {
      if (snap.exists()) {
        const doc = { uid: snap.id, ...snap.data() } as UserDoc;
        setUserDoc(doc);

        // If the role in the __role cookie is stale, refresh the session cookie
        // so middleware allows/blocks the correct routes without a re-login.
        const cookieRole = document.cookie
          .split("; ")
          .find((c) => c.startsWith("__role="))
          ?.split("=")[1];
        if (cookieRole !== doc.role) {
          try {
            const idToken = await user.getIdToken(true);
            await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
            });
          } catch {
            // non-critical — user can still re-login if needed
          }
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });
    return () => unsubDoc();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, userDoc, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
