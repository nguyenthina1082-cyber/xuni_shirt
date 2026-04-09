"use client";

import { TryOnProvider } from "@/contexts/TryOnContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { TryOnContent } from "@/components/business/try-on-content";

export default function Home() {
  return (
    <LanguageProvider>
      <TryOnProvider>
        <TryOnContent />
      </TryOnProvider>
    </LanguageProvider>
  );
}
