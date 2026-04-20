"use client";

import { useState, useRef } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";

export default function FittingRoomPage() {
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const personInputRef = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  const handlePersonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPersonImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setClothingImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleTryOn = async () => {
    if (!personImage || !clothingImage) return;
    setIsLoading(true);
    setResultImage(null);

    try {
      const response = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_image: personImage,
          clothing_image: clothingImage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.result_image) {
          setResultImage(data.data.result_image);
        } else {
          alert(data.error?.message || "试穿失败，请重试");
        }
      } else {
        alert("试穿失败，请重试");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonImage(null);
    setClothingImage(null);
    setResultImage(null);
    if (personInputRef.current) personInputRef.current.value = "";
    if (clothingInputRef.current) clothingInputRef.current.value = "";
  };

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-20 px-6 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-16">
            <h1 className="text-5xl font-semibold tracking-tight text-gray-900 mb-4">
              贝塔换衣间
            </h1>
            <p className="text-xl text-gray-500 font-light">
              上传照片，立即体验虚拟试穿
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">您的照片</h2>
              <div
                className="aspect-[3/4] bg-gray-50 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-300 group"
                onClick={() => personInputRef.current?.click()}
              >
                {personImage ? (
                  <img
                    src={personImage}
                    alt="您的照片"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-blue-500 transition-colors">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="font-medium">点击上传照片</p>
                    <p className="text-sm mt-1 text-gray-400">支持 JPG、PNG</p>
                  </div>
                )}
              </div>
              <input
                ref={personInputRef}
                type="file"
                accept="image/*"
                onChange={handlePersonUpload}
                className="hidden"
              />
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">服装图片</h2>
              <div
                className="aspect-[3/4] bg-gray-50 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-400 transition-all duration-300 group"
                onClick={() => clothingInputRef.current?.click()}
              >
                {clothingImage ? (
                  <img
                    src={clothingImage}
                    alt="服装图片"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-blue-500 transition-colors">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="font-medium">点击上传服装</p>
                    <p className="text-sm mt-1 text-gray-400">支持 JPG、PNG</p>
                  </div>
                )}
              </div>
              <input
                ref={clothingInputRef}
                type="file"
                accept="image/*"
                onChange={handleClothingUpload}
                className="hidden"
              />
            </div>
          </div>

          {resultImage && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 text-center">试穿效果</h2>
              <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 max-w-md mx-auto">
                <div className="aspect-[3/4] bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={resultImage}
                    alt="试穿效果"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTryOn}
              disabled={!personImage || !clothingImage || isLoading}
              className="px-10 py-4 bg-blue-500 text-white rounded-full font-semibold text-lg hover:bg-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-98"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  生成中...
                </span>
              ) : "开始试穿"}
            </button>
            <button
              onClick={handleReset}
              className="px-10 py-4 bg-gray-100 text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-200 transition-all active:scale-98"
            >
              重置
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
