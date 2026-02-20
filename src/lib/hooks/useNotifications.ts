"use client";

import { useEffect, useState } from "react";
import {
  db,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "@/lib/firebase/firestore";
import { useAuth } from "./useAuth";
import type { Notification } from "@/lib/types/notification.types";

export function useNotifications(maxItems = 20) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "in", [user.uid, "all"]),
      orderBy("createdAt", "desc"),
      limit(maxItems)
    );

    const unsub = onSnapshot(q, (snap) => {
      const notifs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.isRead).length);
      setLoading(false);
    });

    return () => unsub();
  }, [user, maxItems]);

  return { notifications, unreadCount, loading };
}
