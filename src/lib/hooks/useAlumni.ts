"use client";

import { useEffect, useState, useCallback } from "react";
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "@/lib/firebase/firestore";
import type { UserDoc } from "@/lib/types/alumni.types";

interface AlumniFilters {
  department?: string;
  batchYear?: number;
  isEmployed?: boolean;
  search?: string;
}

const PAGE_SIZE = 20;

export function useAlumni(filters: AlumniFilters = {}) {
  const [alumni, setAlumni] = useState<UserDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const buildQuery = useCallback(() => {
    const constraints: Parameters<typeof query>[1][] = [
      where("role", "==", "alumni"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    ];
    if (filters.department) constraints.push(where("department", "==", filters.department));
    if (filters.batchYear)  constraints.push(where("batchYear", "==", filters.batchYear));
    return query(collection(db, "users"), ...constraints);
  }, [filters.department, filters.batchYear]);

  useEffect(() => {
    setLoading(true);
    setLastDoc(null);
    setHasMore(true);
    const q = buildQuery();
    getDocs(q).then((snap) => {
      const docs = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc));
      setAlumni(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setLoading(false);
    });
  }, [buildQuery]);

  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;
    const q = query(buildQuery(), startAfter(lastDoc));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc));
    setAlumni((prev) => [...prev, ...docs]);
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
    setHasMore(snap.docs.length === PAGE_SIZE);
  }, [lastDoc, hasMore, buildQuery]);

  return { alumni, loading, loadMore, hasMore };
}
