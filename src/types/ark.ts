export enum ArkModel {
  SEEDREAM_5_0 = "doubao-seedream-5-0-260128",
}

export enum ArkSize {
  SIZE_2K = "2K",
  SIZE_1K = "1K",
  SIZE_4K = "4K",
}

export enum ArkResponseFormat {
  URL = "url",
  BASE64 = "base64",
}

export enum SequentialImageGeneration {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export interface ArkGenerateRequest {
  model?: string;
  prompt: string;
  image: string[];
  sequential_image_generation?: "enabled" | "disabled";
  response_format?: "url" | "base64";
  size?: string;
  stream?: boolean;
  watermark?: boolean;
  n?: number;
}

export interface ArkImageData {
  url?: string;
  base64?: string;
  size?: string;
  revised_prompt?: string;
}

export interface ArkGenerateResponse {
  model: string;
  created: number;
  data: ArkImageData[];
  usage?: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export enum ApiErrorType {
  AUTH_ERROR = 401,
  RATE_LIMIT = 429,
  TIMEOUT = "TIMEOUT",
  SERVER_ERROR = 500,
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ApiError {
  type: ApiErrorType;
  code: number | string;
  message: string;
}

export const ErrorMessages: Record<ApiErrorType, string> = {
  [ApiErrorType.AUTH_ERROR]: "API 配置错误，请检查 API Key",
  [ApiErrorType.RATE_LIMIT]: "请求过于频繁，请稍后再试",
  [ApiErrorType.TIMEOUT]: "生成超时，请重试",
  [ApiErrorType.SERVER_ERROR]: "服务暂时不可用，请稍后再试",
  [ApiErrorType.NETWORK_ERROR]: "网络连接失败，请检查网络",
  [ApiErrorType.UNKNOWN_ERROR]: "发生未知错误，请稍后重试",
};

export interface GenerateOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
