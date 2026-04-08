import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Try-On - AI Powered Fashion Preview",
  description: "Upload your photo and clothing image to see how you look before you buy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        {children}
      </body>
    </html>
  );
}
