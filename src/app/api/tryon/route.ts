import { NextRequest, NextResponse } from "next/server";
import { getArkClient, ApiErrorType } from "@/services/ark";
import { uploadToR2 } from "@/lib/r2";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const personImage = body.personImage || body.person_image;
    const clothingImage = body.clothingImage || body.clothing_image;

    if (!personImage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: "MISSING_PERSON_IMAGE", message: "人物图片不能为空" } },
        { status: 400 }
      );
    }

    if (!clothingImage) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: "MISSING_CLOTHING_IMAGE", message: "服装图片不能为空" } },
        { status: 400 }
      );
    }

    const personImageUrl = personImage.startsWith("data:") ? personImage : `data:image/jpeg;base64,${personImage}`;
    const clothingImageUrl = clothingImage.startsWith("data:") ? clothingImage : `data:image/jpeg;base64,${clothingImage}`;

    const client = getArkClient();
    const result = await client.generateTryOnImage(personImageUrl, clothingImageUrl);

    console.log("🎨 Ark API 返回结果:", JSON.stringify(result, null, 2));

    const imageUrls: string[] = [];

    for (let i = 0; i < result.length; i++) {
      const img = result[i];
      console.log(`🖼️ 处理第 ${i} 张图片, Ark 返回的 url:`, img.url);
      if (img.url) {
        try {
          console.log(`📤 下载 Ark 图片并上传到 R2...`);
          const response = await fetch(img.url);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          console.log(`📦 下载的图片大小:`, buffer.length);
          const fileName = `tryon/${Date.now()}-${i}.png`;
          const uploadedUrl = await uploadToR2(buffer, fileName, "image/png");
          console.log(`✅ 上传成功，R2 URL:`, uploadedUrl);
          imageUrls.push(uploadedUrl);
        } catch (uploadError) {
          console.error(`❌ 处理第 ${i} 张图片失败:`, uploadError);
          imageUrls.push(img.url);
        }
      } else {
        console.log(`⚠️ 第 ${i} 张图片没有 url 字段`);
      }
    }

    console.log("📋 最终返回的 imageUrls:", imageUrls);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { imageUrls, result_image: imageUrls[0] || "" },
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === ApiErrorType.AUTH_ERROR
    ) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: "API_ERROR", message: "API 配置错误，请检查 API Key" } },
        { status: 401 }
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === ApiErrorType.RATE_LIMIT
    ) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: "RATE_LIMIT", message: "请求过于频繁，请稍后再试" } },
        { status: 429 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "生成失败" },
      },
      { status: 500 }
    );
  }
}
