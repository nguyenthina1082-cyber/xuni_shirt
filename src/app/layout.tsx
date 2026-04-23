import type { Metadata } from "next";
import "./globals.css";
import CrispChat from '@/components/crisp-chat';

export const metadata: Metadata = {
  title: "贝塔换衣间 | Virtual Fitting Room",
  description: "上传照片，立即体验虚拟试穿",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">
        <CrispChat />
        {children}
      </body>
    </html>
  );
}
