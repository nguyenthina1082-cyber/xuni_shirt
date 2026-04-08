"use client";

import * as React from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ImageUploaderProps {
  onImageSelect: (url: string, base64: string) => void;
  currentImage?: string | null;
  onClear?: () => void;
  disabled?: boolean;
  label: string;
  hint?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export function ImageUploader({
  onImageSelect,
  currentImage,
  onClear,
  disabled = false,
  label,
  hint,
  aspectRatio = "auto",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(currentImage || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const url = URL.createObjectURL(file);
        setPreview(url);
        onImageSelect(url, base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto min-h-[200px]",
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "group relative cursor-pointer rounded-lg border-2 border-dashed border-[#e5e5e5] bg-[#fafafa] transition-all hover:border-[#171717] dark:border-[#3a3a3a] dark:bg-[#0a0a0a] dark:hover:border-[#ededed]",
          isDragging && "border-[#171717] bg-[#f5f5f5] dark:bg-[#1a1a1a]",
          disabled && "cursor-not-allowed opacity-50",
          preview && "border-solid border-[#171717] dark:border-[#ededed]"
        )}
        onClick={!preview ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className={cn(
                "h-full w-full rounded-lg object-cover",
                aspectRatioClasses[aspectRatio]
              )}
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Change
                </Button>
              </div>
            )}
            {onClear && !disabled && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  onClear();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 p-6",
              aspectRatioClasses[aspectRatio]
            )}
          >
            <div className="rounded-full bg-[#f5f5f5] p-3 dark:bg-[#1a1a1a]">
              {isDragging ? (
                <Upload className="h-6 w-6 text-[#171717] dark:text-[#ededed]" />
              ) : (
                <ImageIcon className="h-6 w-6 text-[#737373]" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#171717] dark:text-[#ededed]">
                {label}
              </p>
              {hint && (
                <p className="text-xs text-[#737373]">{hint}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
