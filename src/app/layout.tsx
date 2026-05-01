import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DomainBreezy",
  description: "Find and secure available domain names from inside ChatGPT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
