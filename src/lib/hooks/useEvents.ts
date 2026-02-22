"use client";

import { useEffect, useState } from "react";
import {
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "@/lib/firebase/firestore";
import type { AlumniEvent } from "@/lib/types/event.types";

interface UseEventsOptions {
  adminView?: boolean;
  statusFilter?: string;
}

export function useEvents({ adminView = false, statusFilter }: UseEventsOptions = {}) {
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, "events"),
      orderBy("startDate", "desc")
    );

    if (!adminView) {
      q = query(
        collection(db, "events"),
        where("status", "==", "published"),
        orderBy("startDate", "desc")
      );
    } else if (statusFilter && statusFilter !== "all") {
      q = query(
        collection(db, "events"),
        where("status", "==", statusFilter),
        orderBy("startDate", "desc")
      );
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AlumniEvent)));
        setLoading(false);
      },
      (err) => {
        console.error("useEvents snapshot error:", err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [adminView, statusFilter]);

  return { events, loading };
}
