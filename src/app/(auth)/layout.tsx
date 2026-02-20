import React from "react";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — Navy brand panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-navy-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-navy-800 opacity-60" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-gold-500 opacity-10 translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 right-0 h-48 w-48 rounded-full bg-navy-700 opacity-40 translate-x-1/4" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500">
            <GraduationCap size={22} className="text-navy-900" />
          </div>
          <span className="text-2xl font-bold text-white">AlumNayan</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <blockquote className="space-y-3">
            <p className="text-4xl font-bold text-white leading-tight">
              Connect. Grow.{" "}
              <span className="text-gold-500">Give Back.</span>
            </p>
            <p className="text-navy-200 text-lg leading-relaxed">
              Your SLSU alumni community — stay connected with your university, discover opportunities, and celebrate every milestone together.
            </p>
          </blockquote>

          <div className="flex gap-6">
            {[
              { value: "10K+", label: "Alumni" },
              { value: "50+",  label: "Departments" },
              { value: "500+", label: "Job Posts" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-gold-500">{stat.value}</p>
                <p className="text-sm text-navy-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} AlumNayan. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800">
            <GraduationCap size={18} className="text-gold-500" />
          </div>
          <span className="text-xl font-bold text-navy-900">AlumNayan</span>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
