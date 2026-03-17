"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin, Clock, Users, Briefcase, ArrowLeft, Upload, Pencil, XCircle,
} from "lucide-react";
import { db, doc, getDoc, setDoc, updateDoc, increment, applicantRef, jobRef } from "@/lib/firebase/firestore";
import { uploadResume } from "@/lib/cloudinary/upload";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { PageLoader } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils/formatters";
import type { Job } from "@/lib/types/job.types";

export const dynamic = 'force-dynamic';

export default function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    getDoc(jobRef(jobId)).then((snap) => {
      if (snap.exists()) setJob({ id: snap.id, ...snap.data() } as Job);
      setLoading(false);
    });
  }, [jobId]);

  useEffect(() => {
    if (!user || !jobId) return;
    getDoc(applicantRef(jobId, user.uid)).then((snap) => setApplied(snap.exists()));
  }, [user, jobId]);

  const handleApply = async () => {
    if (!user || !userDoc || !jobId || !resumeFile) {
      toastError("Please attach your resume.");
      return;
    }
    setApplying(true);
    try {
      const resumeURL = await uploadResume(user.uid, jobId, resumeFile);
      await setDoc(applicantRef(jobId, user.uid), {
        userId: user.uid,
        displayName: userDoc.displayName,
        email: userDoc.email,
        batchYear: userDoc.batchYear ?? null,
        appliedAt: new Date().toISOString(),
        resumeURL,
        coverNote,
        status: "pending",
      });
      await updateDoc(jobRef(jobId), { applicantCount: increment(1) });
      success("Application submitted successfully!");
      setApplied(true);
      setShowModal(false);
    } catch {
      toastError("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const isOwner = !!user && job?.postedBy === user.uid;

  const handleClose = async () => {
    if (!jobId) return;
    setClosing(true);
    try {
      await updateDoc(jobRef(jobId), { status: "closed", updatedAt: new Date().toISOString() });
      setJob((prev) => prev ? { ...prev, status: "closed" } : prev);
      success("Job posting closed.");
    } catch {
      toastError("Failed to close job posting.");
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!job) return <p className="p-8 text-gray-500">Job not found.</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Jobs", href: "/jobs" },
          { label: job.title },
        ]}
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Briefcase size={20} className="text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{job.company}</p>
                  <Badge variant="info">{job.type}</Badge>
                </div>
              </div>

              {[
                { icon: <MapPin size={14} />, label: job.isRemote ? `${job.location} · Remote` : job.location },
                { icon: <Users size={14} />, label: `${job.applicantCount} applicant${job.applicantCount !== 1 ? "s" : ""}` },
                { icon: <Clock size={14} />, label: `Deadline: ${formatDate(job.deadline)}` },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
                  {icon}{label}
                </div>
              ))}

              {isOwner ? (
                <>
                  <Link href={`/jobs/${jobId}/edit`} className="block w-full">
                    <Button variant="secondary" className="w-full" leftIcon={<Pencil size={14} />}>
                      Edit Posting
                    </Button>
                  </Link>
                  {job.status !== "closed" && (
                    <Button
                      variant="ghost"
                      className="w-full text-error hover:text-error"
                      leftIcon={<XCircle size={14} />}
                      loading={closing}
                      onClick={handleClose}
                    >
                      Close Posting
                    </Button>
                  )}
                  {job.status === "closed" && (
                    <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500 font-medium text-center">
                      This posting is closed
                    </div>
                  )}
                </>
              ) : applied ? (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium text-center">
                  ✓ You have applied
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowModal(true)}
                >
                  Apply Now
                </Button>
              )}

              <Button variant="ghost" size="sm" className="w-full" leftIcon={<ArrowLeft size={14} />} onClick={() => router.back()}>
                Back to Jobs
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Apply for this Job" size="md">
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume / CV <span className="text-error">*</span>
            </label>
            <label className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-navy-800 transition-colors">
              <Upload size={24} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {resumeFile ? resumeFile.name : "Click to upload your resume (PDF, DOC)"}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <Textarea
            label="Cover Note"
            placeholder="Briefly explain why you're a great fit for this role..."
            rows={4}
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" loading={applying} onClick={handleApply}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
