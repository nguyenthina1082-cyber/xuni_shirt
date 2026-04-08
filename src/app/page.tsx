"use client";

import { TryOnProvider } from "@/contexts/TryOnContext";
import { TryOnForm } from "@/components/business/try-on-form";
import { TryOnResult } from "@/components/business/try-on-result";
import { AlertCircle } from "lucide-react";
import { useTryOn } from "@/contexts/TryOnContext";

function TryOnContent() {
  const { error, clearError } = useTryOn();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#171717] dark:text-[#ededed]">
          Virtual Try-On
        </h1>
        <p className="mt-2 text-[#737373]">
          Upload your photo and clothing image to see how you look before you buy
        </p>
      </header>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200">
          <AlertCircle className="h-5 w-5" />
          <p className="flex-1 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="space-y-6">
        <TryOnForm />
        <TryOnResult />
      </main>

      <footer className="mt-12 text-center text-sm text-[#737373]">
        <p>Powered by AI • For reference only • Actual fit may vary</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <TryOnProvider>
      <TryOnContent />
    </TryOnProvider>
  );
}
