import { NextRequest, NextResponse } from "next/server";
import { getArkClient, ApiErrorType } from "@/services/ark";
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

    const imageUrls = result.map((img) => img.url || "").filter(Boolean);

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
