import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "野钓App - 发现好钓点",
  description: "野钓爱好者社区，发现钓点、AI识鱼、约钓交友",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
