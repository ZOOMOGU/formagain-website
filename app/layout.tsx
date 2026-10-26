import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "formagain — A new form of feeling.",
  description: "A new beginning, naturally. Sign up for formagain news and collection updates.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "formagain — A new form of feeling.", description: "A new beginning, naturally. Join the formagain mailing list.", type: "website", locale: "en_US" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
