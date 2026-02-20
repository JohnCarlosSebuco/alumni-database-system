"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { eventFormSchema, type EventFormInput } from "@/lib/utils/validators";

interface EventFormProps {
  defaultValues?: Partial<EventFormInput>;
  bannerURL?: string;
  onSubmit: (data: EventFormInput, bannerFile: File | null) => Promise<void>;
  loading?: boolean;
}

export function EventForm({ defaultValues, bannerURL, onSubmit, loading }: EventFormProps) {
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(bannerURL ?? null);

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

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d, bannerFile))} className="space-y-5">
      {/* Banner upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Banner</label>
        <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-navy-800 overflow-hidden transition-colors" style={{ minHeight: 140 }}>
          {preview ? (
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
          { value: "Seminar",   label: "Seminar" },
          { value: "Webinar",   label: "Webinar" },
          { value: "Workshop",  label: "Workshop" },
          { value: "Reunion",   label: "Alumni Reunion" },
          { value: "Sports",    label: "Sports Fest" },
          { value: "Other",     label: "Other" },
        ]} error={errors.type?.message} {...register("type")} />
        <Input label="Max Attendees" type="number" placeholder="Leave blank for unlimited" {...register("maxAttendees", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })} />
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

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={loading} size="lg">
          Save Event
        </Button>
      </div>
    </form>
  );
}
