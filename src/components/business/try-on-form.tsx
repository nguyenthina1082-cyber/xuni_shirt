"use client";

import * as React from "react";
import { RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useTryOn } from "@/contexts/TryOnContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Button } from "@/components/ui/button";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TryOnForm() {
  const {
    state,
    personImage,
    personImageBase64,
    clothingImage,
    clothingImageBase64,
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
  const { t } = useLanguage();

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
    setProgressStatus(t("generatingPleaseWait"));

    try {
      dispatch({ type: "USE_QUOTA" });
      dispatch({ type: "SET_STATE", payload: "generating" });

      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImageBase64: personImageBase64,
          clothingImageBase64: clothingImageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate try-on");
      }

      setProgress(70);
      setProgressStatus(t("generatingPleaseWait"));

      const data = await response.json();

      if (data.success && data.data?.imageUrls?.length > 0) {
        const results = data.data.imageUrls.map((url: string) => ({
          url,
          score: 0,
          reason: "",
        }));
        setResult(results);
      } else {
        throw new Error(data.error?.message || t("noResultsGenerated"));
      }

      setProgress(100);
      setProgressStatus(t("done"));
    } catch (error) {
      console.error("Generation error:", error);
      setError(error instanceof Error ? error.message : t("noResultsGenerated"));
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
    <div className="grid gap-2 grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{t("yourPhoto")}</span>
            <span className="text-xs font-normal text-[#737373]">
              ({t("yourPhotoReuse")})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUploader
            label={t("uploadYourPhoto")}
            hint={t("yourPhotoHint")}
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
          <CardTitle>{t("clothingPhoto")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader
            label={t("uploadClothing")}
            hint={t("clothingPhotoHint")}
            onImageSelect={handleClothingImageSelect}
            currentImage={clothingImage}
            onClear={handleClearClothing}
            disabled={isLoading}
            aspectRatio="auto"
          />

          <div className="space-y-2">
            <Label>{t("clothingType")}</Label>
            <div className="flex gap-2">
              {(["upper", "lower", "full"] as const).map((type) => (
                <Button
                  key={type}
                  variant={clothingType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClothingType(type)}
                  disabled={isLoading}
                >
                  {type === "upper" && t("top")}
                  {type === "lower" && t("bottom")}
                  {type === "full" && t("dress")}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-sm text-[#737373]">
            {quota.totalCredits - quota.usedCredits} {t("of")} {quota.totalCredits} {t("freeTries")}
          </p>
        </div>

        <div className="flex gap-3">
          <ButtonColorful
            size="lg"
            onClick={handleGenerate}
            disabled={!canGenerate() || isLoading}
            className="gap-2"
            label={isLoading ? t("generating") : t("generateTryOn")}
          />

          {(resultImage || resultImages.length > 0) && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleReset}
              disabled={isLoading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("tryAnother")}
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
