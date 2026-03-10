import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { PageTransitionProvider } from "@/providers/PageTransitionProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "AlumNayan — Connect. Grow. Give Back.",
    template: "%s | AlumNayan",
  },
  description:
    "AlumNayan is the exclusive alumni management platform of the SLSU College of Engineering — connecting COE graduates, posting opportunities, and celebrating achievement.",
  keywords: ["alumni", "SLSU", "COE", "College of Engineering", "Southern Luzon State University", "engineering graduates", "networking"],
  icons: {
    icon: "/engineering-logo-nobg.png",
    shortcut: "/engineering-logo-nobg.png",
    apple: "/engineering-logo-nobg.png",
  },
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
    <html lang="en" className={jakarta.variable}>
      <body>
        <AuthProvider>
          <ToastProvider>
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
