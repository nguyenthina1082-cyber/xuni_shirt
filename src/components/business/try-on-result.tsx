"use client";

import * as React from "react";
import { CheckCircle, ThumbsUp, RotateCcw, Download, Share2 } from "lucide-react";
import { useTryOn } from "@/contexts/TryOnContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TryOnResult() {
  const { state, reset, resultImages } = useTryOn();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (state !== "result_ready" || resultImages.length === 0) {
    return null;
  }

  const currentResult = resultImages[selectedIndex];

  const handleDownload = () => {
    if (!currentResult?.url) return;

    fetch(currentResult.url)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tryon-result-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const handleShare = async () => {
    if (!currentResult?.url) return;

    if (navigator.share) {
      try {
        const response = await fetch(currentResult.url);
        const blob = await response.blob();
        const file = new File([blob], "tryon-result.png", { type: "image/png" });

        await navigator.share({
          title: "My Try-On Result",
          text: "Check out my virtual try-on!",
          files: [file],
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      handleDownload();
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Try-On Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg border border-[#e5e5e5] dark:border-[#3a3a3a]">
              <img
                src={currentResult?.url}
                alt="Try-on result"
                className="h-full w-full object-cover"
              />
            </div>

            {resultImages.length > 1 && (
              <div className="flex gap-2">
                {resultImages.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "relative overflow-hidden rounded-md border-2 transition-all",
                      selectedIndex === index
                        ? "border-[#171717] dark:border-[#ededed]"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={result.url}
                      alt={`Result ${index + 1}`}
                      className="h-16 w-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1 gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-1 gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-[#fafafa] p-4 dark:bg-[#1a1a1a]">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="h-4 w-4 text-[#737373]" />
                <span className="text-sm font-medium">AI Quality Score</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{currentResult?.score || 0}</span>
                <span className="text-sm text-[#737373]">/ 10</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#fafafa] p-4 dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium mb-2">AI Assessment</p>
              <p className="text-sm text-[#737373]">
                {currentResult?.reason || "No assessment available"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Tips for better results:</p>
              <ul className="space-y-1 text-sm text-[#737373]">
                <li>• Use clear, front-facing photos</li>
                <li>• Simple backgrounds work best</li>
                <li>• Try different clothing types for variety</li>
              </ul>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This is an AI-generated preview for reference only. Actual fit may vary.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Another Clothing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
