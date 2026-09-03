import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeWaypoints — Coming Soon",
  description:
    "Any repository, turned into a course you can actually finish. Join the waitlist — one email when we launch.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
