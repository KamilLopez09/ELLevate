import type { Metadata, Viewport } from "next";
import { Nunito, Open_Sans } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/providers/MotionProvider";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["600", "700", "800"],
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "ELLevate | Certified Angels",
  description:
    "A free, interactive ESL web app for Certified Angels summer camp — learn English through creative play.",
};

export const viewport: Viewport = {
  themeColor: "#f4f6fb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${openSans.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
