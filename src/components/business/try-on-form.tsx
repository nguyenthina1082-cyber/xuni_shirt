"use client";

import * as React from "react";
import { RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useTryOn } from "@/contexts/TryOnContext";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TryOnForm() {
  const {
    state,
    personImage,
    clothingImage,
    resultImage,
    resultImages,
    clothingType,
    quota,
    setPersonImage,
    setClothingImage,
    setClothingType,
    canGenerate,
    reset,
    setResult,
    setError,
    dispatch,
  } = useTryOn();

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState("");

  const handlePersonImageSelect = (url: string, base64: string) => {
    dispatch({ type: "SET_STATE", payload: "uploading_person" });
    setPersonImage(url, base64);
  };

  const handleClothingImageSelect = (url: string, base64: string) => {
    dispatch({ type: "SET_STATE", payload: "uploading_clothing" });
    setClothingImage(url, base64);
  };

  const handleClearPerson = () => {
    dispatch({ type: "SET_STATE", payload: "idle" });
  };

  const handleClearClothing = () => {
    dispatch({ type: "SET_STATE", payload: "person_uploaded" });
  };

  const handleGenerate = async () => {
    if (!canGenerate()) return;

    setIsGenerating(true);
    setProgress(10);
    setProgressStatus("Generating...");

    try {
      dispatch({ type: "USE_QUOTA" });
      dispatch({ type: "SET_STATE", payload: "generating" });

      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImageUrl: personImage,
          clothingImageUrl: clothingImage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate try-on");
      }

      setProgress(70);
      setProgressStatus("Processing result...");

      const data = await response.json();

      if (data.success && data.data?.imageUrls?.length > 0) {
        const results = data.data.imageUrls.map((url: string, index: number) => ({
          url,
          score: 0,
          reason: "",
        }));
        setResult(results);
      } else {
        throw new Error(data.error?.message || "No results generated");
      }

      setProgress(100);
      setProgressStatus("Done!");
    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    reset();
    setProgress(0);
    setProgressStatus("");
  };

  const isLoading = state === "generating" || isGenerating;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Your Photo</span>
            <span className="text-xs font-normal text-[#737373]">
              (Reused in session)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            label="Upload your photo"
            hint="Clear, front-facing photo works best"
            onImageSelect={handlePersonImageSelect}
            currentImage={personImage}
            onClear={handleClearPerson}
            disabled={isLoading}
            aspectRatio="auto"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clothing Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader
            label="Upload clothing"
            hint="Flat lay or model photo"
            onImageSelect={handleClothingImageSelect}
            currentImage={clothingImage}
            onClear={handleClearClothing}
            disabled={isLoading}
            aspectRatio="auto"
          />

          <div className="space-y-2">
            <Label>Clothing Type</Label>
            <div className="flex gap-2">
              {(["upper", "lower", "full"] as const).map((type) => (
                <Button
                  key={type}
                  variant={clothingType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClothingType(type)}
                  disabled={isLoading}
                >
                  {type === "upper" && "Top"}
                  {type === "lower" && "Bottom"}
                  {type === "full" && "Dress"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-[#737373]">
            {quota.totalCredits - quota.usedCredits} of {quota.totalCredits} free
            tries remaining
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Try-On
              </>
            )}
          </Button>

          {(resultImage || resultImages.length > 0) && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Try Another
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="w-full max-w-md">
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-center text-xs text-[#737373]">
              {progressStatus}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
