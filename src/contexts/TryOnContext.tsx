"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { TryOnState, UserQuota } from "@/types";

interface TryOnContextState {
  state: TryOnState;
  personImage: string | null;
  personImageBase64: string | null;
  clothingImage: string | null;
  clothingImageBase64: string | null;
  clothingType: "upper" | "lower" | "full";
  resultImage: string | null;
  resultImages: Array<{ url: string; score: number; reason: string }>;
  taskId: string | null;
  error: string | null;
  quota: UserQuota;
  sessionId: string;
}

type TryOnAction =
  | { type: "SET_STATE"; payload: TryOnState }
  | { type: "SET_PERSON_IMAGE"; payload: { url: string; base64: string } }
  | { type: "SET_CLOTHING_IMAGE"; payload: { url: string; base64: string } }
  | { type: "SET_CLOTHING_TYPE"; payload: "upper" | "lower" | "full" }
  | { type: "SET_RESULT"; payload: Array<{ url: string; score: number; reason: string }> }
  | { type: "SET_TASK_ID"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" }
  | { type: "USE_QUOTA" }
  | { type: "SET_SESSION_ID"; payload: string };

const initialState: TryOnContextState = {
  state: "idle",
  personImage: null,
  personImageBase64: null,
  clothingImage: null,
  clothingImageBase64: null,
  clothingType: "upper",
  resultImage: null,
  resultImages: [],
  taskId: null,
  error: null,
  quota: {
    freeCredits: 5,
    usedCredits: 0,
    totalCredits: 5,
  },
  sessionId: "",
};

function tryOnReducer(
  state: TryOnContextState,
  action: TryOnAction
): TryOnContextState {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, state: action.payload };
    case "SET_PERSON_IMAGE":
      return {
        ...state,
        personImage: action.payload.url,
        personImageBase64: action.payload.base64,
        state: "person_uploaded",
      };
    case "SET_CLOTHING_IMAGE":
      return {
        ...state,
        clothingImage: action.payload.url,
        clothingImageBase64: action.payload.base64,
        state: "clothing_uploaded",
      };
    case "SET_CLOTHING_TYPE":
      return { ...state, clothingType: action.payload };
    case "SET_RESULT":
      return {
        ...state,
        resultImages: action.payload,
        resultImage: action.payload[0]?.url || null,
        state: "result_ready",
      };
    case "SET_TASK_ID":
      return { ...state, taskId: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, state: "error" };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "USE_QUOTA":
      return {
        ...state,
        quota: {
          ...state.quota,
          usedCredits: state.quota.usedCredits + 1,
        },
      };
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.payload };
    case "RESET":
      return {
        ...initialState,
        personImage: state.personImage,
        personImageBase64: state.personImageBase64,
        quota: state.quota,
        sessionId: state.sessionId,
        state: "person_uploaded",
      };
    default:
      return state;
  }
}

interface TryOnContextValue {
  state: TryOnState;
  clothingType: "upper" | "lower" | "full";
  resultImage: string | null;
  resultImages: Array<{ url: string; score: number; reason: string }>;
  quota: UserQuota;
  taskId: string | null;
  error: string | null;
  personImage: string | null;
  personImageBase64: string | null;
  clothingImage: string | null;
  clothingImageBase64: string | null;
  dispatch: React.Dispatch<TryOnAction>;
  setPersonImage: (url: string, base64: string) => void;
  setClothingImage: (url: string, base64: string) => void;
  setClothingType: (type: "upper" | "lower" | "full") => void;
  setResult: (results: Array<{ url: string; score: number; reason: string }>) => void;
  setTaskId: (taskId: string) => void;
  setError: (error: string) => void;
  clearError: () => void;
  reset: () => void;
  useQuota: () => boolean;
  hasQuota: () => boolean;
  canGenerate: () => boolean;
}

const TryOnContext = createContext<TryOnContextValue | null>(null);

export function TryOnProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tryOnReducer, {
    ...initialState,
    sessionId: typeof window !== "undefined"
      ? sessionStorage.getItem("sessionId") || crypto.randomUUID()
      : crypto.randomUUID(),
  });

  React.useEffect(() => {
    if (state.sessionId) {
      sessionStorage.setItem("sessionId", state.sessionId);
    }
  }, [state.sessionId]);

  const setPersonImage = useCallback((url: string, base64: string) => {
    dispatch({ type: "SET_PERSON_IMAGE", payload: { url, base64 } });
  }, []);

  const setClothingImage = useCallback((url: string, base64: string) => {
    dispatch({ type: "SET_CLOTHING_IMAGE", payload: { url, base64 } });
  }, []);

  const setClothingType = useCallback((type: "upper" | "lower" | "full") => {
    dispatch({ type: "SET_CLOTHING_TYPE", payload: type });
  }, []);

  const setResult = useCallback(
    (results: Array<{ url: string; score: number; reason: string }>) => {
      dispatch({ type: "SET_RESULT", payload: results });
    },
    []
  );

  const setTaskId = useCallback((taskId: string) => {
    dispatch({ type: "SET_TASK_ID", payload: taskId });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const hasQuota = useCallback(() => {
    return state.quota.usedCredits < state.quota.totalCredits;
  }, [state.quota]);

  const useQuota = useCallback(() => {
    if (hasQuota()) {
      dispatch({ type: "USE_QUOTA" });
      return true;
    }
    return false;
  }, [hasQuota]);

  const canGenerate = useCallback(() => {
    return (
      (state.personImage !== null || state.personImageBase64 !== null) &&
      (state.clothingImage !== null || state.clothingImageBase64 !== null) &&
      hasQuota()
    );
  }, [state.personImage, state.personImageBase64, state.clothingImage, state.clothingImageBase64, hasQuota]);

  const value: TryOnContextValue = {
    state: state.state,
    clothingType: state.clothingType,
    resultImage: state.resultImage,
    resultImages: state.resultImages,
    quota: state.quota,
    taskId: state.taskId,
    error: state.error,
    personImage: state.personImage,
    personImageBase64: state.personImageBase64,
    clothingImage: state.clothingImage,
    clothingImageBase64: state.clothingImageBase64,
    dispatch,
    setPersonImage,
    setClothingImage,
    setClothingType,
    setResult,
    setTaskId,
    setError,
    clearError,
    reset,
    useQuota,
    hasQuota,
    canGenerate,
  };

  return (
    <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>
  );
}

export function useTryOn() {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error("useTryOn must be used within a TryOnProvider");
  }
  return context;
}
