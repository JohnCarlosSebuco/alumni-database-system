"use client";

import { useEffect, useState } from "react";
import { onSnapshot, profileDocRef } from "@/lib/firebase/firestore";
import { useAuth } from "./useAuth";
import type { AlumniProfile } from "@/lib/types/alumni.types";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(profileDocRef(user.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as AlumniProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return { profile, loading };
}
