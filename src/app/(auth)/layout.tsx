import React from "react";
import Image from "next/image";

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
          <Image src="/engineering-logo-nobg.png" alt="COE Logo" width={60} height={60} className="rounded-xl" />
          <div>
            <span className="text-2xl font-bold text-white block">AlumNayan</span>
            <span className="text-xs text-navy-300 block">College of Engineering</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <blockquote className="space-y-3">
            <p className="text-4xl font-bold text-white leading-tight">
              Connect. Grow.{" "}
              <span className="text-gold-500">Give Back.</span>
            </p>
            <p className="text-navy-200 text-lg leading-relaxed">
              The exclusive alumni network for SLSU College of Engineering graduates — stay connected, discover opportunities, and celebrate every milestone together.
            </p>
          </blockquote>

          <div className="flex gap-6">
            {[
              { value: "1,000+", label: "COE Alumni" },
              { value: "4",      label: "Programs" },
              { value: "200+",   label: "Job Posts" },
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
          <Image src="/engineering-logo-nobg.png" alt="COE Logo" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold text-navy-900">AlumNayan</span>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
