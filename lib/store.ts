import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  User,
  ResumeData,
  HolisticProfile,
  CareerPreferences,
  PortfolioLinks,
  Application,
  ApplicationStatus,
  Job,
} from "./types";
import { v4 as uuidv4 } from "uuid";

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;

  // Onboarding step tracking
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;

  // Resume
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;

  // Profile
  holisticProfile: HolisticProfile | null;
  setHolisticProfile: (profile: HolisticProfile) => void;

  // Career Preferences
  careerPreferences: CareerPreferences | null;
  setCareerPreferences: (prefs: CareerPreferences) => void;

  // Portfolio
  portfolioLinks: PortfolioLinks | null;
  setPortfolioLinks: (links: PortfolioLinks) => void;

  // Applications
  applications: Application[];
  addApplication: (job: Job, status: ApplicationStatus) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  updateApplicationNotes: (id: string, notes: string) => void;
  removeApplication: (id: string) => void;

  // Onboarding Complete
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      login: (_email: string, _password: string) => {
        set({
          user: {
            id: uuidv4(),
            name: "User",
            email: _email,
            onboardingComplete: false,
          },
          isAuthenticated: true,
        });
      },
      signup: (name: string, email: string, _password: string) => {
        set({
          user: {
            id: uuidv4(),
            name,
            email,
            onboardingComplete: false,
          },
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          onboardingStep: 0,
          resumeData: null,
          holisticProfile: null,
          careerPreferences: null,
          portfolioLinks: null,
          applications: [],
        });
      },

      // Onboarding
      onboardingStep: 0,
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      // Resume
      resumeData: null,
      setResumeData: (data) => set({ resumeData: data }),

      // Profile
      holisticProfile: null,
      setHolisticProfile: (profile) => set({ holisticProfile: profile }),

      // Career Preferences
      careerPreferences: null,
      setCareerPreferences: (prefs) => set({ careerPreferences: prefs }),

      // Portfolio
      portfolioLinks: null,
      setPortfolioLinks: (links) => set({ portfolioLinks: links }),

      // Applications
      applications: [],
      addApplication: (job, status) =>
        set((state) => ({
          applications: [
            ...state.applications,
            {
              id: uuidv4(),
              job,
              status,
              notes: "",
              appliedDate:
                status === "applied" ? new Date().toISOString() : undefined,
              updatedDate: new Date().toISOString(),
            },
          ],
        })),
      updateApplicationStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? { ...app, status, updatedDate: new Date().toISOString() }
              : app,
          ),
        })),
      updateApplicationNotes: (id, notes) =>
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? { ...app, notes, updatedDate: new Date().toISOString() }
              : app,
          ),
        })),
      removeApplication: (id) =>
        set((state) => ({
          applications: state.applications.filter((app) => app.id !== id),
        })),

      // Complete onboarding
      completeOnboarding: () =>
        set((state) => ({
          user: state.user ? { ...state.user, onboardingComplete: true } : null,
          onboardingStep: 5,
        })),
    }),
    {
      name: "vocation-storage",
    },
  ),
);
