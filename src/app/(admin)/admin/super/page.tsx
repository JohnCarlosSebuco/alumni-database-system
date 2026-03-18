"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  collection, getDocs, query, where, orderBy, db,
} from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { ShieldCheck, Users } from "lucide-react";
import type { UserDoc, UserRole } from "@/lib/types/alumni.types";

type PendingAction = {
  targetUid: string;
  targetName: string;
  role: UserRole;
  label: string;
};

function roleBadge(role: UserRole) {
  if (role === "super_admin") return <Badge variant="warning">Super Admin</Badge>;
  if (role === "admin") return <Badge variant="navy">Admin</Badge>;
  return <Badge variant="default">Alumni</Badge>;
}

export default function SuperAdminPage() {
  const { userDoc, loading } = useAuth();
  const router = useRouter();
  const { success, error } = useToast();

  const [admins, setAdmins] = useState<UserDoc[]>([]);
  const [alumni, setAlumni] = useState<UserDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    const usersRef = collection(db, "users");
    const [adminSnap, alumniSnap] = await Promise.all([
      getDocs(query(usersRef, where("role", "in", ["admin", "super_admin"]), orderBy("createdAt", "desc"))),
      getDocs(query(usersRef, where("role", "==", "alumni"), orderBy("createdAt", "desc"))),
    ]);
    setAdmins(adminSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
    setAlumni(alumniSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (userDoc?.role !== "super_admin") {
        router.replace("/admin/dashboard");
        return;
      }
      fetchData();
    }
  }, [loading, userDoc, router, fetchData]);

  const assignRole = async () => {
    if (!pending) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/super/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUid: pending.targetUid, role: pending.role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed");
      }
      success(`${pending.targetName} is now ${pending.role.replace("_", " ")}.`);
      setPending(null);
      await fetchData();
    } catch (e) {
      error((e as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || dataLoading) return <PageLoader />;

  const filteredAlumni = alumni.filter(
    (a) =>
      a.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Super Admin Panel"
        breadcrumbs={[{ label: "Admin" }, { label: "Super Admin" }]}
      />

      {/* Section A — Manage Admins */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-navy-800" />
            <h2 className="text-base font-semibold text-gray-900">Manage Admins</h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {admins.length === 0 ? (
            <p className="text-sm text-gray-500 px-6 py-8 text-center">No admins found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((u) => {
                    const isSelf = u.uid === userDoc?.uid;
                    return (
                      <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{u.displayName}</td>
                        <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{u.email}</td>
                        <td className="px-6 py-4">{roleBadge(u.role)}</td>
                        <td className="px-6 py-4">
                          {isSelf ? (
                            <span className="text-xs text-gray-400 italic">You</span>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap">
                              {u.role === "admin" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      setPending({
                                        targetUid: u.uid,
                                        targetName: u.displayName,
                                        role: "super_admin",
                                        label: "Promote to Super Admin",
                                      })
                                    }
                                  >
                                    Promote to Super Admin
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setPending({
                                        targetUid: u.uid,
                                        targetName: u.displayName,
                                        role: "alumni",
                                        label: "Demote to Alumni",
                                      })
                                    }
                                  >
                                    Demote to Alumni
                                  </Button>
                                </>
                              )}
                              {u.role === "super_admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setPending({
                                      targetUid: u.uid,
                                      targetName: u.displayName,
                                      role: "admin",
                                      label: "Demote to Admin",
                                    })
                                  }
                                >
                                  Demote to Admin
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Section B — Promote Alumni to Admin */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-navy-800" />
              <h2 className="text-base font-semibold text-gray-900">Promote Alumni to Admin</h2>
            </div>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {filteredAlumni.length === 0 ? (
            <p className="text-sm text-gray-500 px-6 py-8 text-center">No alumni found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Batch</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Course</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAlumni.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{u.displayName}</td>
                      <td className="px-6 py-4 text-gray-600 hidden md:table-cell">{u.email}</td>
                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{u.batchYear ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">{u.course ?? "—"}</td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            setPending({
                              targetUid: u.uid,
                              targetName: u.displayName,
                              role: "admin",
                              label: "Make Admin",
                            })
                          }
                        >
                          Make Admin
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={assignRole}
        title="Confirm Role Change"
        message={
          pending
            ? `Are you sure you want to ${pending.label.toLowerCase()} for ${pending.targetName}?`
            : ""
        }
        confirmLabel={pending?.label ?? "Confirm"}
        variant="primary"
        loading={actionLoading}
      />
    </div>
  );
}
