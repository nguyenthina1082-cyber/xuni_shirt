"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TryOnForm } from "@/components/business/try-on-form";
import { TryOnResult } from "@/components/business/try-on-result";
import { AlertCircle } from "lucide-react";
import { useTryOn } from "@/contexts/TryOnContext";
import { TiltCard } from "@/components/ui/tilt-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-flex items-center gap-2">
      <Globe className="h-4 w-4 text-[#737373]" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "zh" | "en")}
        className="appearance-none bg-transparent text-sm text-[#737373] cursor-pointer focus:outline-none"
      >
        <option value="zh">中文</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}

export function TryOnContent() {
  const { error, clearError } = useTryOn();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#171717] dark:text-[#ededed]">
            {t("title")}
          </h1>
          <p className="mt-2 text-[#737373]">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex-none">
          <LanguageSwitcher />
        </div>
      </header>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200">
          <AlertCircle className="h-5 w-5" />
          <p className="flex-1 text-sm">{error}</p>
          <button
            onClick={clearError}
            className="text-sm underline hover:no-underline"
          >
            {t("dismiss")}
          </button>
        </div>
      )}

      <main className="relative">
        <div className="relative rounded-2xl">
          <GlowingEffect disabled={false} />
          <TiltCard>
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <TryOnForm />
            </div>
          </TiltCard>
        </div>
        <TryOnResult />
      </main>

      <footer className="mt-12 text-center text-sm text-[#737373]">
        <p>{t("poweredBy")} • {t("forReference")} • {t("actualFit")}</p>
      </footer>
    </div>
  );
}
