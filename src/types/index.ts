export interface ClothingType {
  type: "upper" | "lower" | "full";
  url?: string;
  base64?: string;
}

export interface TryOnRequest {
  personImageUrl?: string;
  clothingImageUrl?: string;
  prompt?: string;
}

export interface TryOnResult {
  imageUrls: string[];
  scores?: number[];
  reasons?: string[];
}

export interface TryOnRecord {
  id: string;
  sessionId: string;
  personImageUrl: string;
  clothingImageUrl: string;
  resultImageUrl?: string;
  clothingType: "upper" | "lower" | "full";
  aiScore?: number;
  aiReason?: string;
  status: "pending" | "success" | "failed";
  createdAt: Date;
}

export type TryOnState =
  | "idle"
  | "uploading_person"
  | "person_uploaded"
  | "uploading_clothing"
  | "clothing_uploaded"
  | "generating"
  | "result_ready"
  | "error";

export interface UserQuota {
  freeCredits: number;
  usedCredits: number;
  totalCredits: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
