"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AIInputWithSearchProps {
  onSubmit: (value: string, withSearch: boolean) => void;
  onFileSelect: (file: File) => void;
  placeholder?: string;
}

export function AIInputWithSearch({
  onSubmit,
  onFileSelect,
  placeholder = "描述你想要的效果...",
}: AIInputWithSearchProps) {
  const [value, setValue] = useState("");
  const [withSearch, setWithSearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value, withSearch);
    setValue("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      console.log("文件已选择:", file.name, file.type);
      onFileSelect(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={cn(
          "relative flex flex-wrap items-center gap-3 bg-white border-2 rounded-2xl px-6 py-4 transition-all duration-300",
          isFocused ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-200"
        )}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
          accept="image/*"
          className="hidden"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 min-w-[200px] bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={() => setWithSearch(!withSearch)}
          className={cn(
            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            withSearch
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {withSearch ? "🔍 Search" : "✨ Create"}
        </button>

        <button
          type="submit"
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </form>
  );
}
