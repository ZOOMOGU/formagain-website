import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FORM — Every Move Belongs",
  description:
    "FORM 为每一种正在发生的身体而做。DOT / GAP / PAUSE / RESTART / EVERY MOVE BELONGS.",
  icons: {
    icon: "/brand/dot-f.svg",
    shortcut: "/brand/dot-f.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
