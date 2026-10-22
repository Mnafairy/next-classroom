import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./python.css";
import "./flow.css";
import "./classroom.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "КодЛаб · Хичээл сонгох",
  description:
    "Python, JavaScript, Next.js хичээлээ сонгоод код бичиж сурцгаая.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="mn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src="/exam-guard.js" strategy="beforeInteractive" />
        <a className="skip-link" href="#main-content">
          Хичээл рүү очих
        </a>
        {children}
      </body>
    </html>
  );
}
