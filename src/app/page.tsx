import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users, Briefcase, Calendar, BarChart3,
  Bell, Smartphone, ArrowRight,
} from "lucide-react";

export const dynamic = 'force-dynamic';

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-navy-900/95 backdrop-blur-sm border-b border-navy-800">
      <div className="flex items-center gap-2">
        <Image src="/engineering-logo-nobg.png" alt="COE Logo" width={48} height={48} className="rounded-lg" />
        <div>
          <span className="text-lg font-bold text-white block leading-none">AlumNayan</span>
          <span className="text-[10px] text-navy-300 block leading-none">COE · SLSU</span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <a href="#features" className="text-sm text-navy-200 hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="text-sm text-navy-200 hover:text-white transition-colors">How It Works</a>
        <Link href="/login"
          className="text-sm font-medium text-navy-200 hover:text-white transition-colors">
          Sign In
        </Link>
        <Link href="/signup"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors">
          Get Started
          <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-navy-900 overflow-hidden pt-16">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 h-[600px] w-[600px] rounded-full bg-gold-500 opacity-5 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-navy-700 opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-navy-800 border border-navy-700 px-4 py-1.5 text-sm text-gold-400 mb-8">
          <span className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
          Exclusive alumni platform for SLSU College of Engineering
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight text-balance mb-6">
          The Alumni Platform<br />
          Built for{" "}
          <span className="text-gold-500">COE Graduates</span>
        </h1>
        <p className="text-xl text-navy-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          AlumNayan connects SLSU College of Engineering graduates with their university community. Discover job opportunities, attend events, and showcase your achievements — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-base font-semibold text-navy-900 hover:bg-gold-400 transition-colors shadow-lg">
            Join AlumNayan Free
            <ArrowRight size={18} />
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-navy-600 px-8 py-4 text-base font-medium text-navy-100 hover:bg-navy-800 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { value: "1,611+", label: "COE Alumni" },
    { value: "3",      label: "Engineering Programs" },
    { value: "200+",   label: "Job Postings" },
    { value: "50+",    label: "Events Held" },
  ];
  return (
    <section className="bg-gold-500 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-navy-900">{s.value}</p>
              <p className="text-sm font-medium text-navy-800 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <Users size={24} />,
      title: "Alumni Profiles",
      desc: "Complete profiles with education, employment, licenses, awards, research, and community work.",
    },
    {
      icon: <Briefcase size={24} />,
      title: "Job Board",
      desc: "Browse active job postings from partner companies and apply directly with your resume.",
    },
    {
      icon: <Calendar size={24} />,
      title: "Events & Reunions",
      desc: "Discover and RSVP to SLSU events, webinars, and homecoming reunions.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Admin Reports",
      desc: "Export alumni data as CSV or PDF with powerful filters for employment and department tracking.",
    },
    {
      icon: <Bell size={24} />,
      title: "Real-time Notifications",
      desc: "Get instantly notified when new jobs or events are posted matching your interests.",
    },
    {
      icon: <Smartphone size={24} />,
      title: "Mobile Friendly",
      desc: "Fully responsive design that works beautifully on any device — phone, tablet, or desktop.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Everything You Need</h2>
          <p className="mt-3 text-gray-600 text-lg max-w-2xl mx-auto">
            A complete alumni management system built exclusively for the SLSU College of Engineering.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl bg-white p-6 shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-navy-800 mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Sign Up",
      desc: "Create your free alumni account in under 2 minutes using your SLSU email or personal address.",
    },
    {
      step: "02",
      title: "Build Your Profile",
      desc: "Complete all 8 sections of your profile — employment, education, licenses, awards, and more.",
    },
    {
      step: "03",
      title: "Stay Connected",
      desc: "Apply to jobs, RSVP to events, and get updates from your alma mater in real-time.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-navy-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">Get Started in 3 Steps</h2>
          <p className="mt-3 text-navy-200 text-lg">
            Joining AlumNayan is fast, free, and built for every SLSU COE graduate.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px border-t border-dashed border-navy-700" />
              )}
              <div className="relative flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-navy-900 text-2xl font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-navy-300 text-sm leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-base font-semibold text-navy-900 hover:bg-gold-400 transition-colors">
            Join AlumNayan Now
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/engineering-logo-nobg.png" alt="COE Logo" width={44} height={44} className="rounded-lg" />
            <div>
              <p className="text-white font-bold">AlumNayan</p>
              <p className="text-xs text-navy-400">SLSU COE Alumni · Connect. Grow. Give Back.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-navy-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
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

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
}
