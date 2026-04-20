import type {
  ArkGenerateRequest,
  ArkGenerateResponse,
  ArkImageData,
  ApiError,
  GenerateOptions,
} from "@/types/ark";
import { ApiErrorType } from "@/types/ark";

const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 1000;

function createApiError(type: ApiErrorType, message: string, code?: number | string): ApiError {
  return { type, code: code || type, message };
}

function parseApiError(response: Response, responseText?: string): ApiError {
  if (response.status === 401) {
    return createApiError(ApiErrorType.AUTH_ERROR, "API Key 无效或已过期", response.status);
  }

  if (response.status === 429) {
    return createApiError(ApiErrorType.RATE_LIMIT, "请求频率超限，请稍后再试", response.status);
  }

  if (response.status >= 500) {
    return createApiError(ApiErrorType.SERVER_ERROR, "服务器错误，请稍后重试", response.status);
  }

  try {
    if (responseText) {
      const errorData = JSON.parse(responseText);
      return createApiError(
        ApiErrorType.UNKNOWN_ERROR,
        errorData.error?.message || errorData.message || "未知错误",
        response.status
      );
    }
  } catch {
    // ignore parse error
  }

  return createApiError(
    ApiErrorType.UNKNOWN_ERROR,
    `请求失败 (${response.status})`,
    response.status
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ArkImageClient {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel: string = "doubao-seedream-5-0-260128") {
    if (!apiKey) {
      throw new Error("API Key is required");
    }
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async generateImage(
    request: ArkGenerateRequest,
    options: GenerateOptions = {}
  ): Promise<ArkImageData[]> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      retryDelay = DEFAULT_RETRY_DELAY,
    } = options;

    const startTime = Date.now();
    const requestBody: ArkGenerateRequest = {
      model: request.model || this.defaultModel,
      prompt: request.prompt,
      image: request.image,
      sequential_image_generation: request.sequential_image_generation || "disabled",
      response_format: request.response_format || "url",
      size: request.size || "2K",
      stream: false,
      watermark: request.watermark !== undefined ? request.watermark : true,
      n: request.n || 1,
    };

    let lastError: ApiError | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      attempt++;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(ARK_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        const duration = Date.now() - startTime;

        if (!response.ok) {
          const apiError = parseApiError(response, responseText);
          throw apiError;
        }

        const data: ArkGenerateResponse = JSON.parse(responseText);

        if (!data.data || data.data.length === 0) {
          throw createApiError(
            ApiErrorType.UNKNOWN_ERROR,
            "API 返回数据为空"
          );
        }

        return data.data;
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            lastError = createApiError(
              ApiErrorType.TIMEOUT,
              `请求超时（${timeout}ms）`
            );
          } else {
            lastError = createApiError(
              ApiErrorType.NETWORK_ERROR,
              error.message
            );
          }
        } else if ((error as ApiError).type) {
          lastError = error as ApiError;
        } else {
          lastError = createApiError(
            ApiErrorType.UNKNOWN_ERROR,
            String(error)
          );
        }

        if (attempt > retries) {
          break;
        }

        await sleep(retryDelay);
      }
    }

    throw lastError || createApiError(
      ApiErrorType.UNKNOWN_ERROR,
      "请求失败"
    );
  }

  async generateTryOnImage(
    personImageUrl: string,
    clothingImageUrl: string,
    options: GenerateOptions = {}
  ): Promise<ArkImageData[]> {
    const prompt = "将图1的人物换为图2的服装，保持人物的脸部、姿态和背景不变";

    return this.generateImage(
      {
        model: this.defaultModel,
        prompt,
        image: [personImageUrl, clothingImageUrl],
        sequential_image_generation: "disabled",
        response_format: "url",
        size: "2K",
        stream: false,
        watermark: true,
      },
      options
    );
  }
}

let clientInstance: ArkImageClient | null = null;

export function getArkClient(): ArkImageClient {
  if (!clientInstance) {
    const apiKey = process.env.ARK_API_KEY;

    if (!apiKey) {
      throw new Error("ARK_API_KEY environment variable is not set");
    }

    clientInstance = new ArkImageClient(apiKey);
  }

  return clientInstance;
}

export function createArkClient(apiKey: string): ArkImageClient {
  clientInstance = new ArkImageClient(apiKey);
  return clientInstance;
}

export type { ArkImageData, ApiError, GenerateOptions };
export { ApiErrorType };
