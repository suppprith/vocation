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
  CompanyProfile,
  JobPosting,
  JobPostingStatus,
} from "./types";
import { v4 as uuidv4 } from "uuid";
import {
  apiLogin,
  apiSignup,
  apiLogout,
  apiGetMe,
  clearToken,
  getToken,
  type AuthUser,
} from "./api";

function toUser(u: AuthUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? undefined,
    onboardingComplete: u.onboardingComplete,
    roles: u.roles,
  };
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  rehydrateAuth: () => Promise<void>;

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

  // Employer
  companyProfile: CompanyProfile | null;
  setCompanyProfile: (profile: CompanyProfile) => void;
  jobPostings: JobPosting[];
  addJobPosting: (
    posting: Omit<JobPosting, "id" | "createdDate" | "updatedDate">,
  ) => void;
  updateJobPosting: (id: string, updates: Partial<JobPosting>) => void;
  updateJobPostingStatus: (id: string, status: JobPostingStatus) => void;
  removeJobPosting: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      authLoading: false,
      login: async (email: string, password: string) => {
        const { user } = await apiLogin(email, password);
        set({ user: toUser(user), isAuthenticated: true });
      },
      signup: async (name: string, email: string, password: string) => {
        const { user } = await apiSignup(name, email, password);
        set({ user: toUser(user), isAuthenticated: true });
      },
      logout: async () => {
        await apiLogout();
        set({
          user: null,
          isAuthenticated: false,
          onboardingStep: 0,
          resumeData: null,
          holisticProfile: null,
          careerPreferences: null,
          portfolioLinks: null,
          applications: [],
          companyProfile: null,
          jobPostings: [],
        });
      },
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      rehydrateAuth: async () => {
        const token = getToken();
        if (!token) {
          set({ user: null, isAuthenticated: false, authLoading: false });
          return;
        }
        try {
          set({ authLoading: true });
          const authUser = await apiGetMe();
          set({
            user: toUser(authUser),
            isAuthenticated: true,
            authLoading: false,
          });
        } catch {
          clearToken();
          set({ user: null, isAuthenticated: false, authLoading: false });
        }
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

      // Employer
      companyProfile: null,
      setCompanyProfile: (profile) => set({ companyProfile: profile }),

      jobPostings: [],
      addJobPosting: (posting) =>
        set((state) => ({
          jobPostings: [
            ...state.jobPostings,
            {
              ...posting,
              id: uuidv4(),
              createdDate: new Date().toISOString(),
              updatedDate: new Date().toISOString(),
            },
          ],
        })),
      updateJobPosting: (id, updates) =>
        set((state) => ({
          jobPostings: state.jobPostings.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedDate: new Date().toISOString() }
              : p,
          ),
        })),
      updateJobPostingStatus: (id, status) =>
        set((state) => ({
          jobPostings: state.jobPostings.map((p) =>
            p.id === id
              ? { ...p, status, updatedDate: new Date().toISOString() }
              : p,
          ),
        })),
      removeJobPosting: (id) =>
        set((state) => ({
          jobPostings: state.jobPostings.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "vocation-storage",
    },
  ),
);
