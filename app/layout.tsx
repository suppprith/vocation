import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sequelSans = localFont({
  src: [
    {
      path: "../public/fonts/sequel-sans-roman.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/sequel-sans-medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/sequel-sans-semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/sequel-sans-bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/sequel-sans-black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sequel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vocation — The Holistic Career Pathfinder",
  description:
    "Find work that aligns with who you are, not just what's on your resume.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sequelSans.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
