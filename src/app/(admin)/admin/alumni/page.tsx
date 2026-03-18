"use client";

import React, { useState } from "react";
import { Search, Plus, Mail, ShieldCheck, ShieldAlert, Send, FileSpreadsheet } from "lucide-react";
import { useAlumni } from "@/lib/hooks/useAlumni";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlumniTable } from "@/components/alumni/AlumniTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { resetPassword } from "@/lib/firebase/auth";
import type { UserDoc } from "@/lib/types/alumni.types";
import { ImportAlumniModal } from "@/components/admin/ImportAlumniModal";

export const dynamic = "force-dynamic";

const CURRENT_YEAR = new Date().getFullYear();

const BATCH_YEAR_OPTIONS = [
  { value: "", label: "All years" },
  ...Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => {
    const y = CURRENT_YEAR - i;
    return { value: String(y), label: String(y) };
  }),
];
const COURSE_FILTER_OPTIONS = [
  { value: "", label: "All programs" },
  { value: "Bachelor of Science in Industrial Engineering",  label: "BS Industrial Engineering" },
  { value: "Bachelor of Science in Electronics Engineering", label: "BS Electronics Engineering" },
  { value: "Bachelor of Science in Mechanical Engineering",  label: "BS Mechanical Engineering" },
];
const COURSE_FORM_OPTIONS = COURSE_FILTER_OPTIONS.slice(1);
const EMPLOYMENT_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "employed",   label: "Employed" },
  { value: "unemployed", label: "Unemployed" },
];
const CLAIM_OPTIONS = [
  { value: "",          label: "All accounts" },
  { value: "unclaimed", label: "Unclaimed" },
  { value: "claimed",   label: "Claimed" },
];
const FORM_BATCH_YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

// ── Shared form field ────────────────────────────────────────────────────────
function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 disabled:bg-gray-50 disabled:text-gray-400";

// ── Types ────────────────────────────────────────────────────────────────────
interface AlumniForm {
  firstName: string;
  lastName:  string;
  email:     string;
  batchYear: string;
  course:    string;
  studentId: string;
  isActive:  boolean;
}

const EMPTY: AlumniForm = {
  firstName: "", lastName: "", email: "",
  batchYear: "", course: "", studentId: "", isActive: true,
};

function splitName(displayName?: string): { first: string; last: string } {
  const parts = (displayName ?? "").trim().split(" ");
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

function validate(form: AlumniForm): Partial<AlumniForm> {
  const errs: Partial<AlumniForm> = {};
  if (!form.firstName.trim()) errs.firstName = "Required";
  if (!form.lastName.trim())  errs.lastName  = "Required";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = "Valid email required";
  return errs;
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${on ? "bg-navy-800" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${on ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ── Form body (shared between Add and Edit) ───────────────────────────────────
function AlumniFormBody({
  form, setForm, errors, showActive = false,
}: {
  form: AlumniForm;
  setForm: React.Dispatch<React.SetStateAction<AlumniForm>>;
  errors: Partial<AlumniForm>;
  showActive?: boolean;
}) {
  const set = <K extends keyof AlumniForm>(k: K, v: AlumniForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" required error={errors.firstName}>
          <input className={inputCls} placeholder="Juan" value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          <input className={inputCls} placeholder="dela Cruz" value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)} />
        </Field>
      </div>

      <Field label="Email Address" required error={errors.email}>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="email" className={`${inputCls} pl-8`} placeholder="you@example.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Batch Year">
          <select className={inputCls} value={form.batchYear}
            onChange={(e) => set("batchYear", e.target.value)}>
            <option value="">Select year</option>
            {FORM_BATCH_YEARS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Course">
          <select className={inputCls} value={form.course}
            onChange={(e) => set("course", e.target.value)}>
            <option value="">Select course</option>
            {COURSE_FORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Student / Alumni ID No.">
        <input className={inputCls} placeholder="e.g. CEN25-0010" value={form.studentId}
          onChange={(e) => set("studentId", e.target.value)} />
      </Field>

      {showActive && (
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Account active</p>
            <p className="text-xs text-gray-400">Inactive accounts cannot sign in</p>
          </div>
          <Toggle on={form.isActive} onChange={() => set("isActive", !form.isActive)} />
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminAlumniPage() {
  const { userDoc: callerDoc } = useAuth();
  const { success, error: toastError } = useToast();

  // Filters
  const [search, setSearch]           = useState("");
  const [course, setCourse]           = useState("");
  const [batchYear, setBatchYear]     = useState("");
  const [employment, setEmployment]   = useState("");
  const [claimStatus, setClaimStatus] = useState("");

  // Local alumni list (prepend newly added)
  const [extras, setExtras] = useState<UserDoc[]>([]);
  // uid → updated data for optimistic edits across all alumni
  const [editOverrides, setEditOverrides] = useState<Map<string, UserDoc>>(new Map());
  // uids removed optimistically after delete
  const [deletedUids, setDeletedUids] = useState<Set<string>>(new Set());

  const { alumni, loading, error: alumniError, reload: reloadAlumni } = useAlumni({
    batchYear: batchYear ? Number(batchYear) : undefined,
  });

  const allAlumni = [...extras, ...alumni]
    .filter((a) => !deletedUids.has(a.uid))
    .map((a) => editOverrides.get(a.uid) ?? a);

  const filtered = allAlumni.filter((a) => {
    const q = search.toLowerCase();
    if (q && !a.displayName?.toLowerCase().includes(q) && !a.email?.toLowerCase().includes(q))
      return false;
    if (course && a.course !== course) return false;
    if (employment === "employed"   && a.isEmployed !== true)  return false;
    if (employment === "unemployed" && a.isEmployed !== false) return false;
    if (claimStatus === "unclaimed" && !(a.importedByAdmin === true && a.isClaimed === false)) return false;
    if (claimStatus === "claimed"   && a.isClaimed !== true) return false;
    return true;
  });

  // ── Import modal ───────────────────────────────────────────────────────────
  const [showImport, setShowImport] = useState(false);

  function handleImportSuccess(count: number) {
    success(`${count} alumni imported. Refresh the page to see them in the list.`);
  }

  // ── Add modal ──────────────────────────────────────────────────────────────
  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState<AlumniForm>(EMPTY);
  const [addErrors, setAddErrors] = useState<Partial<AlumniForm>>({});
  const [addLoading, setAddLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(addForm);
    setAddErrors(errs);
    if (Object.keys(errs).length) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create account");
      await resetPassword(addForm.email).catch(() => {});
      setExtras((prev) => [data as UserDoc, ...prev]);
      setShowAdd(false);
      setAddForm(EMPTY);
      setAddErrors({});
      success(`Account created! A password setup email was sent to ${addForm.email}.`);
    } catch (e) {
      toastError((e as Error).message);
    } finally {
      setAddLoading(false);
    }
  }

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editTarget,       setEditTarget]       = useState<UserDoc | null>(null);
  const [editForm,         setEditForm]         = useState<AlumniForm>(EMPTY);
  const [editErrors,       setEditErrors]       = useState<Partial<AlumniForm>>({});
  const [editLoading,      setEditLoading]      = useState(false);
  const [emailVerified,    setEmailVerified]    = useState<boolean | null>(null);
  const [verifyLoading,    setVerifyLoading]    = useState(false);

  function openEdit(a: UserDoc) {
    const { first, last } = splitName(a.displayName);
    setEditForm({
      firstName: first,
      lastName:  last,
      email:     a.email ?? "",
      batchYear: a.batchYear ? String(a.batchYear) : "",
      course:    a.course ?? "",
      studentId: a.studentId ?? "",
      isActive:  a.isActive ?? true,
    });
    setEditErrors({});
    setEmailVerified(null); // will be fetched
    setEditTarget(a);
    // Fetch live emailVerified status from Firebase Auth
    fetch(`/api/admin/alumni/${a.uid}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setEmailVerified(d.emailVerified ?? null))
      .catch(() => setEmailVerified(null));
  }

  async function handleForceVerify() {
    if (!editTarget) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`/api/admin/alumni/${editTarget.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailVerified: true }),
      });
      if (!res.ok) throw new Error("Failed to verify");
      setEmailVerified(true);
      success(`${editTarget.displayName}'s email has been marked as verified.`);
    } catch (e) {
      toastError((e as Error).message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    const errs = validate(editForm);
    setEditErrors(errs);
    if (Object.keys(errs).length) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/alumni/${editTarget.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");

      const displayName = `${editForm.firstName.trim()} ${editForm.lastName.trim()}`;
      const updated: UserDoc = {
        ...editTarget,
        displayName,
        email:     editForm.email.trim(),
        batchYear: editForm.batchYear ? Number(editForm.batchYear) : null,
        course:    editForm.course || null,
        studentId: editForm.studentId,
        isActive:  editForm.isActive,
      };

      // Apply override so the row updates immediately regardless of where it came from
      setEditOverrides((prev) => new Map(prev).set(editTarget.uid, updated));
      setEditTarget(null);
      success("Alumni account updated.");
    } catch (e) {
      toastError((e as Error).message);
    } finally {
      setEditLoading(false);
    }
  }

  // ── Resend per-user ────────────────────────────────────────────────────────
  const [resendLoading, setResendLoading] = useState(false);

  async function handleResendEmail() {
    if (!editTarget) return;
    setResendLoading(true);
    try {
      const res = await fetch(`/api/admin/alumni/${editTarget.uid}/resend`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to send email");
      }
      success(`Password reset email sent to ${editTarget.email}.`);
    } catch (e) {
      toastError((e as Error).message);
    } finally {
      setResendLoading(false);
    }
  }

  // ── Resend all unclaimed ───────────────────────────────────────────────────
  const [resendAllLoading, setResendAllLoading] = useState(false);

  async function handleResendAll() {
    setResendAllLoading(true);
    try {
      const res = await fetch("/api/admin/alumni/resend-all", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      success(`Sent to ${data.sent} unclaimed account${data.sent !== 1 ? "s" : ""}.${data.failed ? ` (${data.failed} failed)` : ""}`);
    } catch (e) {
      toastError((e as Error).message);
    } finally {
      setResendAllLoading(false);
    }
  }

  // ── Delete confirm ─────────────────────────────────────────────────────────
  const [deleteTarget,  setDeleteTarget]  = useState<UserDoc | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/super/delete-alumni", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUid: deleteTarget.uid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      // Remove immediately from all lists via the deleted set
      setDeletedUids((prev) => new Set(prev).add(deleteTarget.uid));
      setDeleteTarget(null);
      success(`${deleteTarget.displayName}'s account has been deleted.`);
    } catch (e) {
      toastError((e as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  const isAdmin = callerDoc?.role === "admin" || callerDoc?.role === "super_admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni Directory"
        breadcrumbs={[{ label: "Admin" }, { label: "Alumni" }]}
        actions={
          isAdmin ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                leftIcon={<Send size={16} />}
                loading={resendAllLoading}
                onClick={handleResendAll}
              >
                Resend Setup Emails
              </Button>
              <Button
                variant="ghost"
                leftIcon={<FileSpreadsheet size={16} />}
                onClick={() => setShowImport(true)}
              >
                Import XLSX
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => { setAddForm(EMPTY); setAddErrors({}); setShowAdd(true); }}
              >
                Add Alumni
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-auto sm:max-w-xs"
        />
        <Select options={COURSE_FILTER_OPTIONS} value={course}
          onChange={(e) => setCourse(e.target.value)} className="w-full sm:w-auto sm:max-w-[220px]" />
        <Select options={BATCH_YEAR_OPTIONS} value={batchYear}
          onChange={(e) => setBatchYear(e.target.value)} className="w-full sm:w-auto sm:max-w-[140px]" />
        <Select options={EMPLOYMENT_OPTIONS} value={employment}
          onChange={(e) => setEmployment(e.target.value)} className="w-full sm:w-auto sm:max-w-[160px]" />
        <Select options={CLAIM_OPTIONS} value={claimStatus}
          onChange={(e) => setClaimStatus(e.target.value)} className="w-full sm:w-auto sm:max-w-[160px]" />
        <span className="text-sm text-gray-500">{filtered.length} alumni</span>
      </div>

      {alumniError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {alumniError}
          <button type="button" onClick={reloadAlumni} className="text-red-700 underline text-xs ml-4 flex-shrink-0">
            Retry
          </button>
        </div>
      )}

      <AlumniTable
        alumni={filtered}
        loading={loading}
        onEdit={isAdmin ? openEdit : undefined}
        onDelete={isAdmin ? setDeleteTarget : undefined}
      />

      {/* ── Import Modal ── */}
      <ImportAlumniModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={handleImportSuccess}
      />

      {/* ── Add Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Alumni Account" size="md">
        <form onSubmit={handleAdd} className="p-6 space-y-4">
          <AlumniFormBody form={addForm} setForm={setAddForm} errors={addErrors} />
          <p className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
            A password setup email will be sent so the alumni can set their own password.
          </p>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={addLoading}>Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `Edit — ${editTarget.displayName}` : "Edit Alumni"}
        size="md"
      >
        <form onSubmit={handleEdit} className="p-6 space-y-4">
          <AlumniFormBody form={editForm} setForm={setEditForm} errors={editErrors} showActive />

          {/* Email verification status */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {emailVerified === null ? (
                  <span className="h-3.5 w-3.5 rounded-full bg-gray-200 animate-pulse" />
                ) : emailVerified ? (
                  <ShieldCheck size={15} className="text-green-500 flex-shrink-0" />
                ) : (
                  <ShieldAlert size={15} className="text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700">Email verification</p>
                  <p className="text-xs text-gray-400">
                    {emailVerified === null
                      ? "Checking…"
                      : emailVerified
                      ? "Email is verified"
                      : "Email is not verified — alumni cannot log in"}
                  </p>
                </div>
              </div>
              {emailVerified === false && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={verifyLoading}
                  onClick={handleForceVerify}
                  className="flex-shrink-0 text-amber-700 hover:bg-amber-50 border border-amber-200"
                >
                  Mark as verified
                </Button>
              )}
              {emailVerified === true && (
                <span className="flex-shrink-0 text-xs font-medium text-green-600">Verified ✓</span>
              )}
            </div>
          </div>

          {/* Send password reset email */}
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Password reset email</p>
              <p className="text-xs text-gray-400">Send a link so the alumni can set or change their password.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              leftIcon={<Mail size={13} />}
              loading={resendLoading}
              onClick={handleResendEmail}
              className="flex-shrink-0"
            >
              Send Reset Email
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={editLoading}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Alumni Account"
        message={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.displayName}'s account and all their data. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete Permanently"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
