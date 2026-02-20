import type { Metadata } from "next";
import AlumniDashboardClient from "./AlumniDashboardClient";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: "Dashboard" };

export default function AlumniDashboardPage() {
  return <AlumniDashboardClient />;
}
