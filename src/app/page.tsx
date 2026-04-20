"use client";

import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrls?: string[];
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const hour = new Date().getHours();
  let timeOfDay;
  if (hour < 12) timeOfDay = "上午好";
  else if (hour < 18) timeOfDay = "下午好";
  else timeOfDay = "晚上好";

  const handleSubmit = async (value: string, withSearch: boolean) => {
    if (!value.trim() && pendingImages.length === 0) return;

    const imagesToUse = [...pendingImages];

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
      imageUrls: imagesToUse.length > 0 ? imagesToUse : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setPendingImages([]);

    if (imagesToUse.length >= 2) {
      try {
        const response = await fetch("/api/tryon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            person_image: imagesToUse[0],
            clothing_image: imagesToUse[1],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.result_image) {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "换装完成！效果如下：",
              imageUrls: [data.data.result_image],
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        }
      } catch {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "抱歉，换装失败了，请重试。",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } else {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "请上传人物照片和服装图片，我来帮你换装！",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }

    setIsLoading(false);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPendingImages((prev) => [...prev, result]);
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          "opacity-30"
        )}
      />

      <div className="relative max-w-3xl mx-auto px-6 pt-32 pb-20">
        <header className="text-center mb-12">
          <BlurFade delay={0.25} inView>
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              {timeOfDay}，欢迎来到贝塔换衣间
            </h2>
          </BlurFade>
          <BlurFade delay={0.25 * 2} inView>
            <p className="mt-4 text-lg text-gray-500">
              上传照片，我来帮你换装
            </p>
          </BlurFade>
        </header>

        <div className="max-w-2xl mx-auto mb-12">
          <AIInputWithSearch
            onSubmit={handleSubmit}
            onFileSelect={handleFileSelect}
            placeholder="描述你想要的效果..."
          />
        </div>

        {pendingImages.length > 0 && (
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-sm text-gray-500 mb-3 text-center">已上传 {pendingImages.length} 张图片（第一张为人物，第二张为服装）</p>
            <div className="flex gap-4 justify-center">
              {pendingImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt={`上传${i + 1}`} className="w-24 h-32 object-cover rounded-xl" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-sm text-gray-400 mb-3 text-center">试试这样问：</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleSubmit("把图片1的人物换成图片2的衣服", false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              把图片1的人物换成图片2的衣服
            </button>
            <button
              onClick={() => handleSubmit("帮我把这件衣服换到左边的人身上", false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              帮我把这件衣服换到左边的人身上
            </button>
            <button
              onClick={() => handleSubmit("右边的人穿左边这件衣服", false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
            >
              右边的人穿左边这件衣服
            </button>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="space-y-6">
            {messages.map((msg) => (
              <BlurFade key={msg.id} inView>
                <div className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-6 py-4",
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}>
                    <p className="mb-2">{msg.content}</p>
                    {msg.imageUrls && msg.imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.imageUrls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              alt="结果"
                              className="rounded-xl w-32 h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(url)}
                            />
                            <button
                              onClick={() => downloadImage(url, `result-${Date.now()}.png`)}
                              className="absolute bottom-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="bg-gray-100 rounded-2xl px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <section className="max-w-4xl mx-auto mt-16">
          <h3 className="text-lg font-semibold mb-6 text-center">创作案例</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden cursor-pointer">
                <div className="w-full aspect-[3/4]">
                  <img
                    src={`https://picsum.photos/300/450?random=${i + 10}`}
                    alt={`案例${i}`}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-110 duration-300 transition-all"
                    onClick={() => setPreviewImage(`https://picsum.photos/300/450?random=${i + 10}`)}
                  />
                </div>
                <div className="absolute left-0 right-0 top-0 m-3 flex h-7 w-7 items-center justify-center gap-1 overflow-hidden rounded-full bg-[rgba(51,51,51,0.8)] transition-all duration-300 group-hover:w-[72px]">
                  <span className="text-white text-xs">▶</span>
                  <span className="text-white/80 text-xs">View</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl"
            onClick={() => setPreviewImage(null)}
          >
            ×
          </button>
          <img
            src={previewImage}
            alt="预览"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(previewImage, `preview-${Date.now()}.png`);
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black rounded-full font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载图片
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}
