import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left — Brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 20% 10%, rgba(188,28,66,0.2) 0%, transparent 60%), #3B0010",
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(245,158,11,0.45) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Floating blobs — CSS only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-navy-700/50 blur-[70px] animate-float" />
          <div className="absolute bottom-10 right-[-10%] h-72 w-72 rounded-full bg-gold-500/[0.07] blur-[60px] animate-float [animation-delay:3s]" />
          <div className="absolute top-1/2 left-1/2 h-56 w-56 rounded-full bg-navy-600/30 blur-[50px] animate-float [animation-delay:5.5s]" />
          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy-900/60 to-transparent" />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 w-fit">
          <Image
            src="/engineering-logo-nobg.png"
            alt="CEN Logo"
            width={52}
            height={52}
            className="rounded-xl"
          />
          <div>
            <span className="text-xl font-bold text-white block leading-none tracking-tight">AlumNayan</span>
            <span className="text-[11px] text-navy-300 block mt-0.5">CEN · SLSU</span>
          </div>
        </Link>

        {/* Center content */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold text-gold-500 tracking-[0.25em] uppercase">
              SLSU College of Engineering
            </p>
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Connect. Grow.{" "}
              <span className="text-gold-500">Give Back.</span>
            </h2>
            <p className="text-navy-300 text-base leading-relaxed max-w-sm">
              The exclusive alumni network for SLSU College of Engineering graduates — stay connected, discover opportunities, and celebrate every milestone.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              "Browse real job postings from partner companies",
              "RSVP to reunions, seminars, and webinars",
              "Build your complete alumni profile",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                <span className="text-sm text-navy-300 leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-xs text-navy-500">
            © {new Date().getFullYear()} AlumNayan · SLSU College of Engineering
          </p>
        </div>
      </div>

      {/* ── Right — Form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-6 bg-white relative">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent" />

        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
          <Image
            src="/engineering-logo-nobg.png"
            alt="CEN Logo"
            width={38}
            height={38}
            className="rounded-lg"
          />
          <div>
            <span className="text-lg font-bold text-navy-900 block leading-none">AlumNayan</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">CEN · SLSU</span>
          </div>
        </Link>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    </div>
  );
}
