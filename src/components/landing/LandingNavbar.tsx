"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-500 ease-out ${
        scrolled
          ? "py-3 bg-navy-900/90 backdrop-blur-xl border-b border-navy-800/60 shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          src="/engineering-logo-nobg.png"
          alt="CEN Logo"
          width={40}
          height={40}
          className="rounded-xl"
        />
        <div>
          <span className="text-base font-bold text-white block leading-none tracking-tight">AlumNayan</span>
          <span className="text-[10px] text-navy-300 block leading-none mt-0.5">CEN · SLSU</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features"    className="text-sm text-navy-300 hover:text-white transition-colors duration-200">Features</a>
        <a href="#how-it-works" className="text-sm text-navy-300 hover:text-white transition-colors duration-200">How It Works</a>
        <Link href="/login"    className="text-sm font-medium text-navy-300 hover:text-white transition-colors duration-200">Sign In</Link>
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_2px_16px_rgba(245,158,11,0.3)]"
        >
          Get Started <ArrowRight size={13} />
        </Link>
      </div>
    </nav>
  );
}
