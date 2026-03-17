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
import type { Job } from "@/lib/types/job.types";

interface UseJobsOptions {
  adminView?: boolean;
  statusFilter?: string;
  postedBy?: string;
}

export function useJobs({ adminView = false, statusFilter, postedBy }: UseJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(
      collection(db, "jobs"),
      orderBy("createdAt", "desc")
    );

    if (postedBy) {
      q = query(
        collection(db, "jobs"),
        where("postedBy", "==", postedBy),
        orderBy("createdAt", "desc")
      );
    } else if (!adminView) {
      q = query(
        collection(db, "jobs"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc")
      );
    } else if (statusFilter && statusFilter !== "all") {
      q = query(
        collection(db, "jobs"),
        where("status", "==", statusFilter),
        orderBy("createdAt", "desc")
      );
    }

    const unsub = onSnapshot(
      q,
      (snap) => {
        setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Job)));
        setLoading(false);
      },
      (err) => {
        console.error("useJobs snapshot error:", err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [adminView, statusFilter, postedBy]);

  return { jobs, loading };
}
