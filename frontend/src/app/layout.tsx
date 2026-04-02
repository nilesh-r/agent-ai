import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Sovereign AI — Career Agent Platform",
  description: "AI-powered autonomous career management. Discover jobs, match profiles, and draft personalized outreach — all automated.",
  keywords: ["AI career agent", "job search automation", "Gemini AI", "resume matching"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans flex min-h-screen bg-surface-dim text-on-surface`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
