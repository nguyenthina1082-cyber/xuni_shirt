"use client";

import Link from "next/link";
import { Footer } from "@/components/ui/footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-white text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <h1 className="text-6xl font-bold text-gray-200 mb-4">出错啦</h1>
              <p className="text-xl font-semibold text-gray-900 mb-2">
                抱歉，页面出现了一些问题
              </p>
              <p className="text-gray-500 mb-8">
                我们已经收到错误报告，正在处理中
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => reset()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重试
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  返回首页
                </Link>
              </div>
              <p className="mt-12 text-sm text-gray-500">
                遇到问题？联系我们：<a href="mailto:feedback@runvo.xyz" className="text-blue-600 hover:underline">feedback@runvo.xyz</a>
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}