import type { Metadata, Viewport } from "next";
import { Nunito, Open_Sans } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { PwaProvider } from "@/components/providers/PwaProvider";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
  },
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
        <MotionProvider>
          <LocaleProvider>
            <PwaProvider>{children}</PwaProvider>
          </LocaleProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
