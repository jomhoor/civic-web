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

export async function createGuestSession(): Promise<{ user: any; token: string }> {
  const { data } = await api.post("/auth/guest");
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

// --- Questionnaires ---
export async function getQuestionnaires() {
  const { data } = await api.get("/questionnaires");
  return data;
}

export async function getQuestionnaireProgress() {
  const { data } = await api.get("/questionnaires/progress");
  return data;
}

// --- Questions ---
export async function getCalibrationQuestions(questionnaireId?: string) {
  const { data } = await api.get("/questions/calibration", {
    params: questionnaireId ? { questionnaireId } : {},
  });
  return data;
}

export async function getNextQuestions(userId: string, count = 3, questionnaireId?: string) {
  const params: Record<string, string | number> = { userId, count };
  if (questionnaireId) params.questionnaireId = questionnaireId;
  const { data } = await api.get("/questions/next", { params });
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

export async function resetQuestionnaireResponses(questionnaireId: string) {
  const { data } = await api.delete(`/responses/questionnaire/${questionnaireId}`);
  return data;
}

// --- Compass ---
export async function getCompass(userId: string, questionnaireId?: string) {
  const params: Record<string, string> = { userId };
  if (questionnaireId) params.questionnaireId = questionnaireId;
  const { data } = await api.get("/compass", { params });
  return data;
}

export async function getPublicProfile(userId: string) {
  const { data } = await api.get(`/compass/profile/${userId}`);
  return data;
}

export async function saveSnapshot(userId: string, snapshotName?: string, questionnaireId?: string) {
  const { data } = await api.post("/compass/snapshot", {
    userId,
    snapshotName,
    questionnaireId,
  });
  return data;
}

export async function getHistory(userId: string, questionnaireId?: string) {
  const params: Record<string, string> = { userId };
  if (questionnaireId) params.questionnaireId = questionnaireId;
  const { data } = await api.get("/compass/history", { params });
  return data;
}

export async function getSnapshot(snapshotId: string) {
  const { data } = await api.get(`/compass/snapshot/${snapshotId}`);
  return data;
}

export async function diffSnapshots(id1: string, id2: string) {
  const { data } = await api.get("/compass/diff", { params: { id1, id2 } });
  return data;
}

export async function getFrequencyPreference() {
  const { data } = await api.get("/compass/frequency");
  return data;
}

export async function setFrequencyPreference(frequency: string) {
  const { data } = await api.post("/compass/frequency", { frequency });
  return data;
}

// --- Matchmaking ---
export async function getMatches(mode: string = 'mirror', limit = 10, threshold?: number) {
  const params: Record<string, string | number> = { mode, limit };
  if (threshold !== undefined) params.threshold = threshold;
  const { data } = await api.get("/matches/suggest", { params });
  return data;
}

export async function getMatchSettings() {
  const { data } = await api.get("/matches/settings");
  return data;
}

export async function updateMatchSettings(settings: {
  sharingMode?: string;
  displayName?: string;
  matchThreshold?: number;
}) {
  const { data } = await api.post("/matches/settings", settings);
  return data;
}

// --- Connection Requests ---
export async function sendConnectionRequest(body: {
  receiverId: string;
  matchMode: string;
  matchScore: number;
  message?: string;
}) {
  const { data } = await api.post("/matches/connect", body);
  return data;
}

export async function respondToConnection(connectionId: string, action: "ACCEPTED" | "DECLINED") {
  const { data } = await api.post(`/matches/connect/${connectionId}/respond`, { action });
  return data;
}

export async function cancelConnection(connectionId: string) {
  const { data } = await api.post(`/matches/connect/${connectionId}/cancel`);
  return data;
}

export async function getIncomingRequests() {
  const { data } = await api.get("/matches/incoming");
  return data;
}

export async function getConnections() {
  const { data } = await api.get("/matches/connections");
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

// --- Public Analytics (no auth required) ---
export async function getAnalyticsOverview() {
  const { data } = await api.get("/analytics/overview");
  return data;
}

export async function getAnalyticsAggregate(country?: string) {
  const { data } = await api.get("/analytics/aggregate", {
    params: country ? { country } : {},
  });
  return data;
}

export async function getAnalyticsDistribution(country?: string) {
  const { data } = await api.get("/analytics/distribution", {
    params: country ? { country } : {},
  });
  return data;
}

export async function getAnalyticsTrends(months = 12, country?: string) {
  const { data } = await api.get("/analytics/trends", {
    params: { months, ...(country ? { country } : {}) },
  });
  return data;
}

// --- Poke ---
export async function sendPoke(targetUserId: string) {
  const { data } = await api.post(`/poke/${targetUserId}`);
  return data;
}

export async function getReceivedPokes() {
  const { data } = await api.get("/poke");
  return data;
}

export async function getUnseenPokeCount() {
  const { data } = await api.get("/poke/unseen-count");
  return data;
}

export async function markPokesSeen() {
  const { data } = await api.post("/poke/mark-seen");
  return data;
}

export async function getPokeStatus(targetUserId: string) {
  const { data } = await api.get(`/poke/status/${targetUserId}`);
  return data;
}

// --- E2E Encrypted Chat ---
export async function setChatPublicKey(publicKey: string) {
  const { data } = await api.post("/chat/public-key", { publicKey });
  return data;
}

export async function getChatPublicKey(userId: string) {
  const { data } = await api.get(`/chat/public-key/${userId}`);
  return data;
}

export async function getChatThreads() {
  const { data } = await api.get("/chat/threads");
  return data;
}

export async function getUnseenMessageCount() {
  const { data } = await api.get("/chat/unseen-count");
  return data;
}

export async function getConversation(otherUserId: string, cursor?: string) {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  const { data } = await api.get(`/chat/${otherUserId}`, { params });
  return data;
}

export async function sendEncryptedMessage(receiverId: string, ciphertext: string, nonce: string) {
  const { data } = await api.post(`/chat/${receiverId}`, { ciphertext, nonce });
  return data;
}

export async function markChatSeen(otherUserId: string) {
  const { data } = await api.post(`/chat/${otherUserId}/mark-seen`);
  return data;
}
