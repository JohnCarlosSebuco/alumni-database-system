"use client";

import React, { useRef, useState } from "react";
import {
  Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  failed:  number;
  failedRows: { email: string; reason: string }[];
  detectedColumns: Record<string, string>;
}

interface EnrichResult {
  updated: number;
  skipped: number;
  failed:  number;
  failedRows: { email: string; reason: string }[];
  detectedColumns: Record<string, string>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function ImportAlumniModal({ open, onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]               = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<ImportResult | null>(null);
  const [enrichResult, setEnrichResult] = useState<EnrichResult | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [showCols, setShowCols]       = useState(false);

  function reset() {
    setFile(null);
    setResult(null);
    setEnrichResult(null);
    setError(null);
    setLoading(false);
    setShowCols(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleFile(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext ?? "")) {
      setError("Only .xlsx and .xls files are supported.");
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/import-alumni", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setResult(data as ImportResult);
      const r = data as ImportResult;
      if (r.created > 0 || r.updated > 0) onSuccess(r.created + r.updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnrich() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setEnrichResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/enrich-alumni", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setEnrichResult(data as EnrichResult);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import Alumni from XLSX" size="md">
      <div className="p-6 space-y-5">
        {enrichResult ? (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-700">{enrichResult.updated}</p>
                <p className="text-xs text-blue-600 mt-1">Updated</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-2xl font-bold text-gray-600">{enrichResult.skipped}</p>
                <p className="text-xs text-gray-500 mt-1">Skipped</p>
              </div>
              <div className={`rounded-xl border p-4 ${enrichResult.failed > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-2xl font-bold ${enrichResult.failed > 0 ? "text-red-600" : "text-gray-600"}`}>
                  {enrichResult.failed}
                </p>
                <p className={`text-xs mt-1 ${enrichResult.failed > 0 ? "text-red-500" : "text-gray-500"}`}>Failed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
              <CheckCircle size={15} className="flex-shrink-0" />
              {enrichResult.updated} alumni record{enrichResult.updated !== 1 ? "s" : ""} updated with survey field data.
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={reset}>Update Another</Button>
              <Button variant="primary" type="button" onClick={handleClose}>Done</Button>
            </div>
          </>
        ) : !result ? (
          <>
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors cursor-pointer ${
                dragging
                  ? "border-navy-500 bg-navy-50"
                  : file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 bg-gray-50 hover:border-navy-400 hover:bg-navy-50"
              }`}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {file ? (
                <>
                  <FileSpreadsheet size={32} className="text-green-500 mb-2" />
                  <p className="text-sm font-semibold text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    className="mt-2 text-xs text-gray-400 hover:text-red-500 underline"
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <Upload size={28} className="text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Drop your XLSX here, or{" "}
                    <span className="text-navy-700 underline">browse</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports .xlsx and .xls</p>
                </>
              )}
            </div>

            {/* Info */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">How it works</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Column headers are matched automatically — different column names are fine</li>
                <li>New emails create accounts; existing emails get updated with XLSX data</li>
                <li>New accounts are left <em>unclaimed</em> — alumni use <strong>/claim</strong> to set a password</li>
                <li>Existing alumni profiles are updated — empty tab data gets populated from the XLSX</li>
              </ul>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700 space-y-1">
              <p className="font-semibold">Already imported alumni?</p>
              <p>Use <strong>Update Existing</strong> to enrich existing records with survey fields (e.g. time-to-first-job) without creating new accounts.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
              <Button
                variant="outline"
                type="button"
                loading={loading}
                disabled={!file}
                onClick={handleEnrich}
              >
                Update Existing
              </Button>
              <Button
                variant="primary"
                type="button"
                loading={loading}
                disabled={!file}
                onClick={handleImport}
              >
                Import New
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Result summary cards */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-2xl font-bold text-green-700">{result.created}</p>
                <p className="text-xs text-green-600 mt-1">Created</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                <p className="text-xs text-blue-600 mt-1">Updated</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-2xl font-bold text-gray-600">{result.skipped}</p>
                <p className="text-xs text-gray-500 mt-1">Skipped</p>
              </div>
              <div className={`rounded-xl border p-4 ${result.failed > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-2xl font-bold ${result.failed > 0 ? "text-red-600" : "text-gray-600"}`}>
                  {result.failed}
                </p>
                <p className={`text-xs mt-1 ${result.failed > 0 ? "text-red-500" : "text-gray-500"}`}>Failed</p>
              </div>
            </div>

            {/* Status message */}
            {(result.created > 0 || result.updated > 0) && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">
                <CheckCircle size={15} className="flex-shrink-0" />
                <span>
                  {result.created > 0 && <>{result.created} new alumni account{result.created !== 1 ? "s" : ""} created. </>}
                  {result.updated > 0 && <>{result.updated} existing account{result.updated !== 1 ? "s" : ""} updated with XLSX data. </>}
                  {result.created > 0 && <>New accounts can be claimed at <strong>/claim</strong>.</>}
                </span>
              </div>
            )}
            {result.created === 0 && result.updated === 0 && result.skipped > 0 && result.failed === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
                <AlertCircle size={15} className="flex-shrink-0" />
                No changes were made — all data is already up to date.
              </div>
            )}

            {/* Failed rows */}
            {result.failedRows.length > 0 && (
              <div className="rounded-lg border border-red-100 overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-2.5 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100"
                  onClick={() => setShowCols((s) => !s)}
                >
                  {result.failedRows.length} failed row{result.failedRows.length !== 1 ? "s" : ""}
                  {showCols ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
                {showCols && (
                  <div className="max-h-36 overflow-y-auto divide-y divide-red-50">
                    {result.failedRows.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 px-4 py-2 text-xs text-red-600 bg-white">
                        <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-medium">{r.email}</span>
                          {" — "}
                          {r.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Detected columns (collapsible) */}
            {Object.keys(result.detectedColumns).length > 0 && (
              <details className="rounded-lg border border-gray-100">
                <summary className="cursor-pointer px-4 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50">
                  Detected columns ({Object.keys(result.detectedColumns).length})
                </summary>
                <div className="px-4 pb-3 pt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(result.detectedColumns).map(([field, header]) => (
                    <div key={field} className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{field}</span>
                      {" → "}
                      <span className="text-gray-400">{header}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={reset}>
                Import Another
              </Button>
              <Button variant="primary" type="button" onClick={handleClose}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
