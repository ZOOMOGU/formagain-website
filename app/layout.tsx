import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "formagain — A new form of feeling.",
  description: "让身体自由，让生机发生。formagain 即将到来，订阅品牌来信，迎接下一个开始。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: { title: "formagain — A new form of feeling.", description: "未来有形，生机不息。订阅 formagain，迎接下一个开始。", type: "website", locale: "zh_CN" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
