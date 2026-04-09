import { NextRequest, NextResponse } from "next/server";
import { getArkClient, ApiErrorType } from "@/services/ark";
import type { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { personImageBase64, clothingImageBase64 } = body;

    console.log(`[API] TryOn request received`, {
      hasPersonImage: !!personImageBase64,
      hasClothingImage: !!clothingImageBase64,
      duration: `${Date.now() - startTime}ms`,
    });

    if (!personImageBase64) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: "MISSING_PERSON_IMAGE", message: "人物图片不能为空" },
        },
        { status: 400 }
      );
    }

    if (!clothingImageBase64) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: "MISSING_CLOTHING_IMAGE", message: "服装图片不能为空" },
        },
        { status: 400 }
      );
    }

    const client = getArkClient();

    const personImageUrl = personImageBase64.startsWith("data:")
      ? personImageBase64
      : `data:image/jpeg;base64,${personImageBase64}`;

    const clothingImageUrl = clothingImageBase64.startsWith("data:")
      ? clothingImageBase64
      : `data:image/jpeg;base64,${clothingImageBase64}`;

    const result = await client.generateTryOnImage(personImageUrl, clothingImageUrl);

    console.log(`[API] TryOn request success`, {
      imageCount: result.length,
      duration: `${Date.now() - startTime}ms`,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        imageUrls: result.map((img) => img.url || "").filter(Boolean),
        sizes: result.map((img) => img.size).filter(Boolean),
      },
    });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    console.error(`[API] TryOn request failed`, {
      error: error instanceof Error ? error.message : String(error),
      duration: `${duration}ms`,
    });

    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === ApiErrorType.AUTH_ERROR
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: "API_ERROR", message: "API 配置错误，请检查 API Key" },
        },
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
        {
          success: false,
          error: { code: "RATE_LIMIT", message: "请求过于频繁，请稍后再试" },
        },
        { status: 429 }
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === ApiErrorType.TIMEOUT
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: { code: "TIMEOUT", message: "生成超时，请重试" },
        },
        { status: 504 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "生成失败，请稍后重试",
        },
      },
      { status: 500 }
    );
  }
}
