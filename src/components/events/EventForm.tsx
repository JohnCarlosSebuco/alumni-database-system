"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { Upload, Eye, Calendar, MapPin, Users, Video, X } from "lucide-react";
import { format } from "date-fns";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { eventFormSchema, type EventFormInput } from "@/lib/utils/validators";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface EventFormProps {
  defaultValues?: Partial<EventFormInput>;
  bannerURL?: string;
  onSubmit: (data: EventFormInput, bannerFile: File | null) => Promise<void>;
  loading?: boolean;
}

const typeGradient: Record<string, string> = {
  Seminar:  "from-purple-800 to-purple-600",
  Webinar:  "from-blue-800   to-blue-600",
  Workshop: "from-orange-700 to-amber-500",
  Reunion:  "from-pink-700   to-rose-500",
  Sports:   "from-green-700  to-emerald-500",
  Other:    "from-navy-800   to-navy-600",
};

export function EventForm({ defaultValues, bannerURL, onSubmit, loading }: EventFormProps) {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(bannerURL ?? null);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"card" | "detail">("detail");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EventFormInput>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      status: "draft",
      isVirtual: false,
      maxAttendees: null,
      ...defaultValues,
    },
  });

  const isVirtual = watch("isVirtual");
  const formValues = watch();

  // ── Banner upload ──────────────────────────────────────────────
  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawImageSrc(URL.createObjectURL(file));
    setCrop(undefined);
    setCompletedCrop(null);
    setCropModalOpen(true);
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current) return;
    if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      if (rawImageSrc) {
        const res = await fetch(rawImageSrc);
        const blob = await res.blob();
        const file = new File([blob], "banner.jpg", { type: blob.type });
        setBannerFile(file);
        setPreview(URL.createObjectURL(blob));
      }
      setCropModalOpen(false);
      return;
    }
    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height
    );
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], "banner.jpg", { type: "image/jpeg" });
      setBannerFile(croppedFile);
      setPreview(URL.createObjectURL(blob));
      setCropModalOpen(false);
    }, "image/jpeg", 0.92);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setRawImageSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
  };

  // ── Preview helpers ────────────────────────────────────────────
  const previewEvent = {
    id: "preview",
    title:       formValues.title       || "Event Title",
    description: formValues.description || "",
    type:        formValues.type        || "Seminar",
    startDate:   formValues.startDate   || new Date().toISOString(),
    endDate:     formValues.endDate     || new Date().toISOString(),
    location:    formValues.location    || "",
    isVirtual:   formValues.isVirtual   ?? false,
    meetingLink: formValues.meetingLink || "",
    maxAttendees: formValues.maxAttendees ?? null,
    status:      formValues.status      || "draft",
    bannerURL:   preview                || "",
    rsvpCount:   0,
    createdBy:   "",
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  };

  const gradient = typeGradient[previewEvent.type] ?? "from-navy-800 to-navy-600";
  let previewMonth = "";
  let previewDay   = "";
  try {
    const d = new Date(previewEvent.startDate);
    previewMonth = format(d, "MMM");
    previewDay   = format(d, "d");
  } catch {}

  return (
    <>
      {/* ── Crop Modal ──────────────────────────────────────── */}
      {cropModalOpen && rawImageSrc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-900">
            <span className="text-white font-medium text-sm">Crop Banner Image</span>
            <span className="text-gray-400 text-xs">Drag to select a crop area, or confirm to use the full image</span>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={imgRef} src={rawImageSrc} alt="Crop preview" style={{ maxHeight: "70vh", maxWidth: "100%" }} />
            </ReactCrop>
          </div>
          <div className="flex justify-end gap-3 px-5 py-4 bg-gray-900">
            <Button variant="ghost" onClick={handleCropCancel} className="text-gray-300 hover:text-white">Cancel</Button>
            <Button variant="primary" onClick={handleCropConfirm}>Use This Crop</Button>
          </div>
        </div>
      )}

      {/* ── Preview Modal ───────────────────────────────────── */}
      {previewOpen && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 overflow-y-auto py-8 px-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Alumni Preview</span>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("detail")}
                    className={cn("px-3 py-1.5 transition-colors", previewTab === "detail" ? "bg-navy-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                  >
                    Detail page
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("card")}
                    className={cn("px-3 py-1.5 transition-colors border-l border-gray-200", previewTab === "card" ? "bg-navy-800 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
                  >
                    Card view
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 bg-gray-100">
              {previewTab === "detail" ? (
                /* ── Detail view ── */
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      {previewEvent.bannerURL && (
                        <div className="rounded-2xl overflow-hidden bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={previewEvent.bannerURL} alt={previewEvent.title} className="w-full object-contain" />
                        </div>
                      )}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
                        <h2 className="text-base font-semibold text-gray-900">About This Event</h2>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {previewEvent.description || <span className="text-gray-400 italic">No description provided.</span>}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                        <Badge variant="navy">{previewEvent.type}</Badge>
                        {[
                          { icon: <Calendar size={14} />, label: `${formatDate(previewEvent.startDate)} — ${formatDate(previewEvent.endDate)}` },
                          { icon: previewEvent.isVirtual ? <Video size={14} /> : <MapPin size={14} />, label: previewEvent.isVirtual ? "Online / Virtual" : (previewEvent.location || "No location set") },
                          { icon: <Users size={14} />, label: `0 attendees` },
                        ].map(({ icon, label }) => (
                          <div key={label} className="flex items-center gap-2 text-sm text-gray-600">{icon}{label}</div>
                        ))}
                        <div className="rounded-lg bg-navy-800 text-white px-4 py-2 text-sm font-medium text-center opacity-60 select-none">
                          RSVP Now
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Card view ── */
                <div className="max-w-xs mx-auto">
                  <div className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {/* Banner */}
                    <div className="relative h-36 overflow-hidden flex-shrink-0">
                      {previewEvent.bannerURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewEvent.bannerURL} alt={previewEvent.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center", gradient)}>
                          <Calendar size={40} className="text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/95 shadow-sm">
                        <span className="text-[9px] font-bold uppercase leading-none text-gray-500">{previewMonth}</span>
                        <span className="text-base font-bold leading-tight text-gray-900">{previewDay}</span>
                      </div>
                      {previewEvent.type && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">{previewEvent.type}</span>
                        </div>
                      )}
                      {previewEvent.isVirtual && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-teal-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">Online</span>
                        </div>
                      )}
                    </div>
                    {/* Body */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{previewEvent.title}</h3>
                        {previewEvent.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">{previewEvent.description}</p>
                        )}
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400 pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(previewEvent.startDate)}</span>
                        {!previewEvent.isVirtual && previewEvent.location && (
                          <span className="flex items-center gap-1"><MapPin size={11} /><span className="truncate max-w-[120px]">{previewEvent.location}</span></span>
                        )}
                        <span className="flex items-center gap-1 ml-auto"><Users size={11} />0 RSVPs</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end px-4 py-2.5 bg-gray-50/60 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-navy-700">View event →</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main form ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit((d) => onSubmit(d, bannerFile))} className="space-y-5">
        {/* Banner upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
          <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-navy-800 overflow-hidden transition-colors" style={{ minHeight: 140 }}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Banner" className="w-full h-36 object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <Upload size={24} className="text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload banner image</span>
              </div>
            )}
            <input type="file" accept="image/*" className="sr-only" onChange={handleBanner} />
          </label>
        </div>

        <Input label="Event Title" error={errors.title?.message} {...register("title")} />
        <Textarea label="Description" rows={5} error={errors.description?.message} {...register("description")} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Event Type" options={[
            { value: "Seminar",  label: "Seminar" },
            { value: "Webinar",  label: "Webinar" },
            { value: "Workshop", label: "Workshop" },
            { value: "Reunion",  label: "Alumni Reunion" },
            { value: "Sports",   label: "Sports Fest" },
            { value: "Other",    label: "Other" },
          ]} error={errors.type?.message} {...register("type")} />
          <Input label="Max Attendees" type="number" placeholder="Leave blank for unlimited" {...register("maxAttendees", { setValueAs: (v) => (v === "" || v === null || v === undefined) ? null : Number(v) })} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Start Date & Time" type="datetime-local" error={errors.startDate?.message} {...register("startDate")} />
          <Input label="End Date & Time" type="datetime-local" error={errors.endDate?.message} {...register("endDate")} />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isVirtual" className="h-4 w-4 rounded border-gray-300 text-navy-800" {...register("isVirtual")} />
          <label htmlFor="isVirtual" className="text-sm text-gray-700">This is a virtual / online event</label>
        </div>

        {isVirtual ? (
          <Input label="Meeting Link (Zoom, Meet, Teams, etc.)" type="url" {...register("meetingLink")} />
        ) : (
          <Input label="Venue / Location" error={errors.location?.message} {...register("location")} />
        )}

        <Select label="Status" options={[
          { value: "draft",     label: "Draft" },
          { value: "published", label: "Published (visible to alumni)" },
          { value: "completed", label: "Completed" },
        ]} error={errors.status?.message} {...register("status")} />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" leftIcon={<Eye size={15} />} onClick={() => setPreviewOpen(true)}>
            Preview
          </Button>
          <Button type="submit" variant="primary" loading={loading} size="lg">
            Save Event
          </Button>
        </div>
      </form>
    </>
  );
}
