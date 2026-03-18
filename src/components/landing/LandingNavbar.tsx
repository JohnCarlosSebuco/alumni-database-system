"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-500 ease-out ${
        scrolled || menuOpen
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

      {/* Desktop nav */}
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

      {/* Hamburger button */}
      <button
        className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-navy-900/95 backdrop-blur-xl border-b border-navy-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out overflow-hidden ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4 gap-1">
          <a
            href="#features"
            onClick={closeMenu}
            className="py-3 text-base text-navy-300 hover:text-white transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={closeMenu}
            className="py-3 text-base text-navy-300 hover:text-white transition-colors duration-200"
          >
            How It Works
          </a>
          <Link
            href="/login"
            onClick={closeMenu}
            className="py-3 text-base font-medium text-navy-300 hover:text-white transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={closeMenu}
            className="mt-2 mb-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors duration-200 shadow-[0_2px_16px_rgba(245,158,11,0.3)]"
          >
            Get Started <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
