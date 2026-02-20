import React from "react";
import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy-900 text-center px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 mb-6">
        <GraduationCap size={32} className="text-navy-900" />
      </div>
      <h1 className="text-8xl font-bold text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-navy-200 mb-3">Page Not Found</h2>
      <p className="text-navy-300 max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
      >
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  );
}
