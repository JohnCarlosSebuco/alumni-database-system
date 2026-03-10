"use client";

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { SurveyBuilder } from "@/components/surveys/SurveyBuilder";

export const dynamic = "force-dynamic";

export default function NewSurveyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Survey"
        breadcrumbs={[
          { label: "Admin" },
          { label: "Surveys", href: "/admin/surveys" },
          { label: "New" },
        ]}
      />
      <Card>
        <CardBody>
          <SurveyBuilder />
        </CardBody>
      </Card>
    </div>
  );
}
