import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/**
 * Axios request interceptor — attaches the JWT from Zustand store
 * to every outgoing request as `Authorization: Bearer <token>`.
 */
api.interceptors.request.use((config) => {
  // Dynamic import-free access: read persisted Zustand state from localStorage
  try {
    const raw = localStorage.getItem("civic-compass-store");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token && !token.startsWith("mock-jwt-")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return config;
});

// --- Auth (SIWE) ---
export async function getNonce(): Promise<{ nonce: string }> {
  const { data } = await api.get("/auth/nonce");
  return data;
}

export async function verifySiwe(message: string, signature: string) {
  const { data } = await api.post("/auth/verify", { message, signature });
  return data;
}

/** @deprecated Use SIWE flow (getNonce + verifySiwe) instead */
export async function walletAuth(walletAddress: string, isSmartWallet = false) {
  const { data } = await api.post("/auth/wallet", {
    walletAddress,
    isSmartWallet,
  });
  return data;
}

export async function activateResearch(userId: string, inviteCode: string) {
  const { data } = await api.post("/auth/research", { userId, inviteCode });
  return data;
}

// --- Questions ---
export async function getCalibrationQuestions() {
  const { data } = await api.get("/questions/calibration");
  return data;
}

export async function getNextQuestions(userId: string, count = 3) {
  const { data } = await api.get("/questions/next", {
    params: { userId, count },
  });
  return data;
}

export async function seedQuestions() {
  const { data } = await api.post("/questions/seed");
  return data;
}

// --- Responses ---
export async function submitResponses(
  userId: string,
  responses: { questionId: string; answerValue: number; responseTimeMs?: number }[]
) {
  const { data } = await api.post("/responses", { userId, responses });
  return data;
}

// --- Compass ---
export async function getCompass(userId: string) {
  const { data } = await api.get("/compass", { params: { userId } });
  return data;
}

export async function saveSnapshot(userId: string, snapshotName?: string) {
  const { data } = await api.post("/compass/snapshot", {
    userId,
    snapshotName,
  });
  return data;
}

export async function getHistory(userId: string) {
  const { data } = await api.get("/compass/history", { params: { userId } });
  return data;
}

// --- Wallet ---
export async function getWallet(userId: string) {
  const { data } = await api.get("/wallet", { params: { userId } });
  return data;
}

export async function getTransactions(userId: string) {
  const { data } = await api.get("/wallet/transactions", {
    params: { userId },
  });
  return data;
}
