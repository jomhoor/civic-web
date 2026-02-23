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
  hasVisited: boolean;
  hasOnboarded: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFontSize: (fontSize: FontSize) => void;
  markVisited: () => void;
  markOnboarded: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      theme: "dark",
      language: "en",
      fontSize: "normal",
      hasVisited: false,
      hasOnboarded: false,
      setAuth: (user, token) => set({ user, token, hasVisited: true, hasOnboarded: true }),
      logout: () => set({ user: null, token: null }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      markVisited: () => set({ hasVisited: true }),
      markOnboarded: () => set({ hasOnboarded: true }),
    }),
    {
      name: "civic-compass-store",
      version: 1,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          // Existing users who already have a user/token are returning users
          if (state.user && state.token) {
            state.hasVisited = true;
            state.hasOnboarded = true;
          }
        }
        return state as unknown as AppState;
      },
    }
  )
);
