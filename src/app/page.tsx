import React from "react";
import Link from "next/link";
import Image from "next/image";
import admin from "@/lib/firebase/admin";
import { LandingNavbar }       from "@/components/landing/LandingNavbar";
import { LandingHero }         from "@/components/landing/LandingHero";
import { LandingPrograms }     from "@/components/landing/LandingPrograms";
import { LandingFeatures }     from "@/components/landing/LandingFeatures";
import { LandingJobsPreview,   type JobPreview   } from "@/components/landing/LandingJobsPreview";
import { LandingEventsPreview, type EventPreview } from "@/components/landing/LandingEventsPreview";
import { LandingHowItWorks }   from "@/components/landing/LandingHowItWorks";

export const dynamic = "force-dynamic";

async function getActiveJobs(): Promise<JobPreview[]> {
  try {
    const snap = await admin
      .firestore()
      .collection("jobs")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id:        d.id,
        title:     data.title     ?? "",
        company:   data.company   ?? "",
        location:  data.location  ?? "",
        type:      data.type      ?? "",
        isRemote:  data.isRemote  ?? false,
        createdAt: data.createdAt ?? new Date().toISOString(),
      };
    });
  } catch {
    return [];
  }
}

async function getUpcomingEvents(): Promise<EventPreview[]> {
  try {
    const snap = await admin
      .firestore()
      .collection("events")
      .where("status", "==", "published")
      .orderBy("startDate", "asc")
      .limit(3)
      .get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id:        d.id,
        title:     data.title     ?? "",
        type:      data.type      ?? "",
        startDate: data.startDate ?? new Date().toISOString(),
        location:  data.location  ?? "",
        isVirtual: data.isVirtual ?? false,
        rsvpCount: data.rsvpCount ?? 0,
      };
    });
  } catch {
    return [];
  }
}

function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/engineering-logo-nobg.png" alt="CEN Logo" width={44} height={44} className="rounded-lg" />
            <div>
              <p className="text-white font-bold">AlumNayan</p>
              <p className="text-xs text-navy-400">SLSU CEN Alumni · Connect. Grow. Give Back.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-navy-400">
            <a href="#features"    className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link href="/login"  className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs text-navy-500">
            © {new Date().getFullYear()} AlumNayan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default async function LandingPage() {
  const [jobs, events] = await Promise.all([
    getActiveJobs(),
    getUpcomingEvents(),
  ]);

  return (
    <main>
      <LandingNavbar />
      <LandingHero />
      <LandingPrograms />
      <LandingFeatures />
      {jobs.length   > 0 && <LandingJobsPreview   jobs={jobs} />}
      {events.length > 0 && <LandingEventsPreview events={events} />}
      <LandingHowItWorks />
      <Footer />
    </main>
  );
}
