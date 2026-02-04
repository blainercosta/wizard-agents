import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
        className={`${pressStart2P.variable} ${jetbrainsMono.variable} font-mono antialiased bg-background-primary text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
