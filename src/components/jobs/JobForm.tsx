"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { jobFormSchema, type JobFormInput } from "@/lib/utils/validators";

interface JobFormProps {
  defaultValues?: Partial<JobFormInput>;
  onSubmit: (data: JobFormInput) => Promise<void>;
  loading?: boolean;
}

export function JobForm({ defaultValues, onSubmit, loading }: JobFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<JobFormInput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      status: "draft",
      isRemote: false,
      type: "Full-time",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Job Title" error={errors.title?.message} {...register("title")} />
        <Input label="Company" error={errors.company?.message} {...register("company")} />
      </div>

      <Textarea
        label="Job Description"
        rows={6}
        hint="Describe the role, responsibilities, qualifications, and benefits."
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label="Job Type"
          options={[
            { value: "Full-time",  label: "Full-time" },
            { value: "Part-time",  label: "Part-time" },
            { value: "Contract",   label: "Contract" },
            { value: "Internship", label: "Internship" },
            { value: "Freelance",  label: "Freelance" },
          ]}
          error={errors.type?.message}
          {...register("type")}
        />
        <Input label="Industry" error={errors.industry?.message} {...register("industry")} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Location" error={errors.location?.message} {...register("location")} />
        <Input label="Application Deadline" type="date" error={errors.deadline?.message} {...register("deadline")} />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="isRemote" className="h-4 w-4 rounded border-gray-300 text-navy-800" {...register("isRemote")} />
        <label htmlFor="isRemote" className="text-sm text-gray-700">This is a remote position</label>
      </div>

      <Select
        label="Status"
        options={[
          { value: "draft",  label: "Draft" },
          { value: "active", label: "Active (visible to alumni)" },
          { value: "closed", label: "Closed" },
        ]}
        error={errors.status?.message}
        {...register("status")}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={loading} size="lg">
          Save Job Posting
        </Button>
      </div>
    </form>
  );
}
