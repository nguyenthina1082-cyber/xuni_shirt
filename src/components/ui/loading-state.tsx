"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "./progress";

interface LoadingStateProps {
  progress: number;
  status: string;
  subStatus?: string;
}

export function LoadingState({
  progress,
  status,
  subStatus,
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-[#171717] dark:text-[#ededed]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#171717] dark:text-[#ededed]">
          {status}
        </p>
        {subStatus && (
          <p className="text-xs text-[#737373]">{subStatus}</p>
        )}
      </div>
      <Progress value={progress} className="w-full max-w-xs" />
    </div>
  );
}
