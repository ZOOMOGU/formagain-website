import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "formagain — A new form of feeling.",
  description: "A little care. A world of possibility. Plant a small beginning with formagain.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "formagain — A new form of feeling.", description: "A little care. A world of possibility. Let’s make something beautiful, together.", type: "website", locale: "en_US" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
