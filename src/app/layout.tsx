import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uber Eats",
  description: "Voice-to-text ordering with memory context",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
