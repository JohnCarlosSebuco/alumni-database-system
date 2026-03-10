"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDoc, getDocs } from "@/lib/firebase/firestore";
import { surveyRef, surveyResponsesRef } from "@/lib/firebase/firestore";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Spinner } from "@/components/ui/Spinner";
import { SurveyBuilder } from "@/components/surveys/SurveyBuilder";
import { SurveyResponses } from "@/components/surveys/SurveyResponses";
import type { Survey, SurveyResponse } from "@/lib/types/survey.types";

export const dynamic = "force-dynamic";

export default function SurveyDetailPage() {
  const params = useParams();
  const surveyId = params.surveyId as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loadingSurvey, setLoadingSurvey] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  useEffect(() => {
    getDoc(surveyRef(surveyId)).then((snap) => {
      if (snap.exists()) setSurvey({ id: snap.id, ...snap.data() } as Survey);
      setLoadingSurvey(false);
    });
  }, [surveyId]);

  useEffect(() => {
    if (activeTab !== "responses") return;
    setLoadingResponses(true);
    getDocs(surveyResponsesRef(surveyId)).then((snap) => {
      setResponses(snap.docs.map((d) => d.data() as SurveyResponse));
      setLoadingResponses(false);
    });
  }, [activeTab, surveyId]);

  if (loadingSurvey) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!survey) {
    return <p className="text-sm text-gray-500 py-8 text-center">Survey not found.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={survey.title}
        breadcrumbs={[
          { label: "Admin" },
          { label: "Surveys", href: "/admin/surveys" },
          { label: survey.title },
        ]}
      />

      <Tabs
        tabs={[
          { key: "edit",      label: "Edit" },
          { key: "responses", label: "Responses" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "edit" && (
        <Card>
          <CardBody>
            <SurveyBuilder survey={survey} />
          </CardBody>
        </Card>
      )}

      {activeTab === "responses" && (
        <div>
          {loadingResponses ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <SurveyResponses survey={survey} responses={responses} />
          )}
        </div>
      )}
    </div>
  );
}
