import type {
  ArkGenerateRequest,
  ArkGenerateResponse,
  ArkImageData,
  ApiError,
  GenerateOptions,
} from "@/types/ark";
import { ApiErrorType } from "@/types/ark";

const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

const DEFAULT_TIMEOUT = 120000;
const DEFAULT_RETRIES = 1;
const DEFAULT_RETRY_DELAY = 2000;

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
    customPrompt?: string,
    options: GenerateOptions = {}
  ): Promise<ArkImageData[]> {
    const prompt = customPrompt || "将图1的人物换为图2的服装，保持人物的脸部、姿态和背景不变";

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

  async generateImageWithPrompt(
    prompt: string,
    imageUrls: string[],
    options: GenerateOptions = {}
  ): Promise<ArkImageData[]> {
    return this.generateImage(
      {
        model: this.defaultModel,
        prompt,
        image: imageUrls,
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

const ARK_TEXT_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

interface TextCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface TextCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateStyleTip(userName: string): Promise<string> {
  const apiKey = process.env.ARK_API_KEY;

  if (!apiKey) {
    throw new Error("ARK_API_KEY environment variable is not set");
  }

  const messages: TextCompletionMessage[] = [
    {
      role: "system",
      content: `你是一个时尚穿搭助手，请根据用户的名字，生成一段50字左右的个性化穿搭推荐/问候语。
要求：
1. 语言温馨亲切，像朋友聊天
2. 可以根据名字推测用户性格或风格
3. 包含今日穿搭建议或鼓励话语
4. 不要太长，50字左右即可
5. 直接输出文案，不要加引号或其他标记`,
    },
    {
      role: "user",
      content: `用户名字是：${userName}`,
    },
  ];

  const response = await fetch(ARK_TEXT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "doubao-seed-chat-250604",
      messages,
      max_tokens: 200,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error(`文本生成失败: ${response.status}`);
  }

  const data: TextCompletionResponse = await response.json();

  return data.choices[0]?.message?.content || "今日穿搭灵感已送达，快来试试新造型吧！";
}

export async function generateConversationResponse(
  userMessage: string,
  userName?: string
): Promise<string> {
  const apiKey = process.env.ARK_API_KEY;

  if (!apiKey) {
    throw new Error("ARK_API_KEY environment variable is not set");
  }

  const nameContext = userName ? `用户名字是"${userName}"，` : "";

  const messages: TextCompletionMessage[] = [
    {
      role: "system",
      content: `你是一个时尚穿搭助手和贴心朋友。你的任务是根据用户的描述和他们分享的照片，生成一段温馨、自然的对话回复。

要求：
1. 语言亲切自然，像朋友聊天，不要太正式
2. 回复要贴合用户的具体需求（换什么衣服、什么场景等）
3. 可以适当夸奖或鼓励用户
4. 控制在30-60字左右
5. 不要加引号、emoji或特殊标记，直接输出纯文本
6. 语气要像真人朋友在聊天，不能像客服`,
    },
    {
      role: "user",
      content: `${nameContext}用户说：${userMessage}。请生成一段自然的回复。`,
    },
  ];

  const response = await fetch(ARK_TEXT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "doubao-seed-chat-250604",
      messages,
      max_tokens: 200,
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    throw new Error(`文本生成失败: ${response.status}`);
  }

  const data: TextCompletionResponse = await response.json();

  return data.choices[0]?.message?.content || "换装完成！来看看效果吧～";
}
