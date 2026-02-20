import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AlumNayan — Connect. Grow. Give Back.",
    template: "%s | AlumNayan",
  },
  description:
    "AlumNayan is the exclusive alumni management platform of the SLSU College of Engineering — connecting COE graduates, posting opportunities, and celebrating achievement.",
  keywords: ["alumni", "SLSU", "COE", "College of Engineering", "Southern Luzon State University", "engineering graduates", "networking"],
  openGraph: {
    title: "AlumNayan",
    description: "Connect. Grow. Give Back.",
    siteName: "AlumNayan",
    images: [{ url: "/og-image.png" }],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
