"use client";
import { Users, Briefcase, Calendar, BarChart3, Bell, Smartphone, LucideIcon } from "lucide-react";
import { useInView } from "@/lib/hooks/useInView";

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Users,
    title: "Alumni Profiles",
    desc: "Complete profiles with education, employment, licenses, awards, research, and community work.",
  },
  {
    icon: Briefcase,
    title: "Job Board",
    desc: "Browse active job postings from partner companies and apply directly with your resume.",
  },
  {
    icon: Calendar,
    title: "Events & Reunions",
    desc: "Discover and RSVP to SLSU events, webinars, and homecoming reunions.",
  },
  {
    icon: BarChart3,
    title: "Admin Reports",
    desc: "Export alumni data as CSV or PDF with powerful filters for employment and department tracking.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    desc: "Get instantly notified when new jobs or events are posted matching your interests.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    desc: "Fully responsive design that works beautifully on any device — phone, tablet, or desktop.",
  },
];

export function LandingFeatures() {
  const { ref: headRef, inView: headIn } = useInView();
  const { ref: gridRef, inView: gridIn } = useInView(0.08);

  return (
    <section id="features" className="relative py-32 bg-white overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#3B0010 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Top fade from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div
          ref={headRef}
          className={`text-center mb-20 transition-all duration-700 ease-out ${
            headIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[11px] font-semibold text-gold-600 tracking-[0.25em] uppercase mb-4">
            Platform Features
          </p>
          <h2 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Everything you need.
          </h2>
          <p className="mt-5 text-xl text-gray-400 max-w-xl mx-auto font-light leading-relaxed">
            Built exclusively for the SLSU College of Engineering alumni community.
          </p>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group relative rounded-3xl bg-gray-50/80 p-8 overflow-hidden cursor-default
                  transition-all duration-500 ease-out
                  hover:-translate-y-1.5 hover:bg-white hover:shadow-[0_12px_48px_rgba(59,0,16,0.08)]
                  ${gridIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: gridIn ? `${i * 70}ms` : "0ms" }}
              >
                {/* Gold top-edge line — appears on hover */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Icon */}
                <div className="relative mb-7">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl text-gold-400 group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: "linear-gradient(135deg, #3B0010 0%, #800024 100%)",
                      boxShadow: "0 4px 16px rgba(59,0,16,0.3)",
                    }}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-2 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
