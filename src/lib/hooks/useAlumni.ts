"use client";

import { useEffect, useState, useCallback } from "react";
import {
  db,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "@/lib/firebase/firestore";
import type { UserDoc } from "@/lib/types/alumni.types";

interface AlumniFilters {
  department?: string;
  batchYear?: number;
}

export function useAlumni(filters: AlumniFilters = {}) {
  const [alumni, setAlumni]   = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const constraints: Parameters<typeof query>[1][] = [
        where("role", "==", "alumni"),
        orderBy("createdAt", "desc"),
      ];
      if (filters.batchYear)   constraints.push(where("batchYear",   "==", filters.batchYear));
      if (filters.department)  constraints.push(where("department",  "==", filters.department));

      const snap = await getDocs(query(collection(db, "users"), ...constraints));
      setAlumni(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
    } catch (err) {
      console.error("[useAlumni]", err);
      setError("Failed to load alumni. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [filters.batchYear, filters.department]);

  useEffect(() => { load(); }, [load]);

  return { alumni, loading, error, reload: load };
}
