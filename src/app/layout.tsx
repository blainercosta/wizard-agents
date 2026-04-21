import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PostHogProvider } from "@/components/posthog-provider";
import { IdentifyOnAuth } from "@/components/identify-on-auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wizard Agents - Open Source Prompts for Claude Code",
  description: "Repository of custom instructions for Claude Code. Open source plug-and-play prompts. By Blainer Costa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background-primary text-text-primary`}
      >
        <PostHogProvider>
          <IdentifyOnAuth />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
