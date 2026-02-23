import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  walletAddress: string;
  isSmartWallet: boolean;
  isResearchParticipant: boolean;
}

export type Theme = "dark" | "light";
export type Language = "en" | "fa";
export type FontSize = "normal" | "large" | "xlarge";

interface AppState {
  user: User | null;
  token: string | null;
  theme: Theme;
  language: Language;
  fontSize: FontSize;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFontSize: (fontSize: FontSize) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      theme: "dark",
      language: "en",
      fontSize: "normal",
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    { name: "civic-compass-store" }
  )
);
