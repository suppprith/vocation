const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

class ApiError extends Error {
  code: string;
  status: number;
  details?: { field: string; message: string }[];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: { field: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearToken() {
  localStorage.removeItem("auth_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = body.error || {};
    throw new ApiError(
      res.status,
      err.code || "UNKNOWN_ERROR",
      err.message || `Request failed with status ${res.status}`,
      err.details,
    );
  }

  return res.json();
}

// --- Auth ---

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  onboardingComplete: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface MeResponse {
  user: AuthUser;
}

export async function apiSignup(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  return data;
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function apiLogout(): Promise<void> {
  try {
    await request<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    clearToken();
  }
}

export async function apiGetMe(): Promise<AuthUser> {
  const data = await request<MeResponse>("/api/auth/me");
  return data.user;
}

// --- Dashboard ---

export interface DashboardStats {
  totalApplications: number;
  statusCounts: {
    saved: number;
    applied: number;
    interviewing: number;
    offer: number;
    rejected: number;
  };
  totalActiveJobs: number;
}

export interface ProfileCompletion {
  percentage: number;
  sections: {
    resumeData: boolean;
    workStyle: boolean;
    careerPreferences: boolean;
    portfolioLinks: boolean;
  };
}

export interface DashboardRecentApplication {
  id: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
  };
}

export interface DashboardRecommendedJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string;
  workArrangement: string;
  matchScore: number;
  matchReason: string;
  salaryRange: string;
}

export interface DashboardData {
  stats: DashboardStats;
  profileCompletion: ProfileCompletion;
  recentApplications: DashboardRecentApplication[];
  recommendedJobs: DashboardRecommendedJob[];
}

export async function apiGetDashboard(): Promise<DashboardData> {
  return request<DashboardData>("/api/dashboard");
}

// --- Resume Upload ---

export async function apiUploadResume(file: File): Promise<{
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  rawText: string;
}> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/resume/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = body.error || {};
    throw new ApiError(
      res.status,
      err.code || "UNKNOWN_ERROR",
      err.message || `Upload failed with status ${res.status}`,
      err.details,
    );
  }

  return res.json();
}

// --- Onboarding ---

export async function apiCompleteOnboarding(): Promise<{
  user: { id: string; onboardingComplete: boolean };
}> {
  return request("/api/onboarding/complete", { method: "POST" });
}

// --- Profile ---

export interface ProfileData {
  resumeData: {
    skills: string[];
    education: {
      institution: string;
      degree: string;
      field: string;
      year: string;
    }[];
    experience: {
      company: string;
      role: string;
      duration: string;
      description: string;
    }[];
    resumeFileUrl?: string;
  } | null;
  holisticProfile: {
    workStyle: {
      collaboration: number;
      structure: number;
      riskTolerance: number;
    };
    passions: string[];
  } | null;
  careerPreferences: {
    targetRoles: string[];
    preferredIndustries: string[];
    workArrangement: string[];
    employmentType: string[];
    companySize: string[];
    salaryMin?: number;
    salaryMax?: number;
    willingToRelocate: boolean;
    availableToStart: string;
  } | null;
  portfolioLinks: {
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
    design?: string | null;
    blog?: string | null;
    other?: string | null;
  } | null;
}

export async function apiGetProfile(): Promise<ProfileData> {
  return request<ProfileData>("/api/profile");
}

export async function apiUpdateResume(data: {
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
}): Promise<{ success: boolean }> {
  return request("/api/profile/resume", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateWorkStyle(data: {
  workStyle: {
    collaboration: number;
    structure: number;
    riskTolerance: number;
  };
  passions: string[];
}): Promise<{ success: boolean }> {
  return request("/api/profile/work-style", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateCareerPreferences(data: {
  targetRoles: string[];
  preferredIndustries: string[];
  workArrangement: string[];
  employmentType: string[];
  companySize: string[];
  salaryMin?: number;
  salaryMax?: number;
  willingToRelocate: boolean;
  availableToStart: string;
}): Promise<{ success: boolean }> {
  return request("/api/profile/career-preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiUpdatePortfolioLinks(data: {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  design?: string;
  blog?: string;
  other?: string;
}): Promise<{ success: boolean }> {
  return request("/api/profile/portfolio-links", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// --- Jobs ---

export interface ApiJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string | null;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  workArrangement: "remote" | "hybrid" | "onsite";
  employmentType: "full-time" | "contract" | "internship" | "part-time";
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  industry: string;
  skills: string[];
  salaryRange?: string;
  applyUrl: string;
  matchScore: number;
  matchReason: string;
  postedDate: string;
}

export interface JobsResponse {
  jobs: ApiJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function apiGetJobs(params?: {
  search?: string;
  industry?: string;
  workArrangement?: string;
  companySize?: string;
  employmentType?: string;
  page?: number;
  limit?: number;
}): Promise<JobsResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  }
  const qs = searchParams.toString();
  return request<JobsResponse>(`/api/jobs${qs ? `?${qs}` : ""}`);
}

export async function apiGetRecommendedJobs(
  limit?: number,
): Promise<{ jobs: ApiJob[] }> {
  const qs = limit ? `?limit=${limit}` : "";
  return request<{ jobs: ApiJob[] }>(`/api/jobs/recommended${qs}`);
}

export async function apiGetMatchedJobs(params?: {
  page?: number;
  limit?: number;
}): Promise<JobsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return request<JobsResponse>(`/api/jobs/matches${qs ? `?${qs}` : ""}`);
}

export async function apiGetMapJobs(
  bounds?: string,
): Promise<{ jobs: ApiJob[] }> {
  const qs = bounds ? `?bounds=${encodeURIComponent(bounds)}` : "";
  return request<{ jobs: ApiJob[] }>(`/api/jobs/map${qs}`);
}

export async function apiGetJob(id: string): Promise<{ job: ApiJob }> {
  return request<{ job: ApiJob }>(`/api/jobs/${encodeURIComponent(id)}`);
}

// --- Applications ---

export interface ApiApplicationJob {
  id: string;
  title: string;
  company: string;
  location: string;
  workArrangement: string;
  salaryRange?: string;
}

export interface ApiApplication {
  id: string;
  status: string;
  notes: string | null;
  appliedAt: string;
  statusHistory: { from: string | null; to: string; changedAt: string }[];
  job: ApiApplicationJob;
}

export interface ApplicationsResponse {
  applications: ApiApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrackerResponse {
  tracker: {
    saved: ApiApplication[];
    applied: ApiApplication[];
    interviewing: ApiApplication[];
    offer: ApiApplication[];
    rejected: ApiApplication[];
  };
}

export async function apiCreateApplication(data: {
  jobId: string;
  status?: string;
  notes?: string;
}): Promise<{ application: ApiApplication }> {
  return request("/api/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetApplications(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApplicationsResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  }
  const qs = searchParams.toString();
  return request<ApplicationsResponse>(
    `/api/applications${qs ? `?${qs}` : ""}`,
  );
}

export async function apiGetTracker(): Promise<TrackerResponse> {
  return request<TrackerResponse>("/api/applications/tracker");
}

export async function apiGetApplication(
  id: string,
): Promise<{ application: ApiApplication }> {
  return request<{ application: ApiApplication }>(
    `/api/applications/${encodeURIComponent(id)}`,
  );
}

export async function apiUpdateApplicationStatus(
  id: string,
  status: string,
  notes?: string,
): Promise<{ application: ApiApplication }> {
  return request(`/api/applications/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, ...(notes ? { notes } : {}) }),
  });
}

export async function apiDeleteApplication(
  id: string,
): Promise<{ success: boolean }> {
  return request(`/api/applications/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// --- Company Profile ---

export interface ApiCompanyProfile {
  companyName: string;
  industry: string;
  companySize: string;
  description: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  location: string;
  foundedYear?: number | null;
  employeeCount?: number | null;
  benefits?: string[];
  techStack?: string[];
  socialLinks?: {
    linkedin?: string | null;
    twitter?: string | null;
    github?: string | null;
  };
}

export async function apiCreateCompany(
  data: ApiCompanyProfile,
): Promise<{ companyProfile: ApiCompanyProfile }> {
  return request("/api/company", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetCompany(): Promise<{
  companyProfile: ApiCompanyProfile;
}> {
  return request<{ companyProfile: ApiCompanyProfile }>("/api/company");
}

export async function apiUpdateCompany(
  data: ApiCompanyProfile,
): Promise<{ companyProfile: ApiCompanyProfile }> {
  return request("/api/company", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// --- Employer Job Postings ---

export interface ApiJobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  workArrangement: "remote" | "hybrid" | "onsite";
  employmentType: "full-time" | "contract" | "internship" | "part-time";
  companySize?: string;
  industry?: string;
  skills: string[];
  salaryRange?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applyUrl?: string;
  status: "draft" | "active" | "paused" | "closed";
  company?: string;
  companyLogo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobPostingsResponse {
  jobPostings: ApiJobPosting[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function apiCreateJobPosting(data: {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  workArrangement: string;
  employmentType: string;
  companySize?: string;
  industry?: string;
  skills?: string[];
  salaryRange?: string;
  salaryMin?: number;
  salaryMax?: number;
  applyUrl?: string;
}): Promise<{ jobPosting: ApiJobPosting }> {
  return request("/api/employer/jobs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiGetJobPostings(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<JobPostingsResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  }
  const qs = searchParams.toString();
  return request<JobPostingsResponse>(
    `/api/employer/jobs${qs ? `?${qs}` : ""}`,
  );
}

export async function apiGetJobPosting(
  id: string,
): Promise<{ jobPosting: ApiJobPosting }> {
  return request<{ jobPosting: ApiJobPosting }>(
    `/api/employer/jobs/${encodeURIComponent(id)}`,
  );
}

export async function apiUpdateJobPosting(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    location: string;
    latitude: number;
    longitude: number;
    workArrangement: string;
    employmentType: string;
    companySize: string;
    industry: string;
    skills: string[];
    salaryRange: string;
    salaryMin: number;
    salaryMax: number;
    applyUrl: string;
  }>,
): Promise<{ jobPosting: ApiJobPosting }> {
  return request(`/api/employer/jobs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateJobPostingStatus(
  id: string,
  status: string,
): Promise<{ jobPosting: ApiJobPosting }> {
  return request(`/api/employer/jobs/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function apiDeleteJobPosting(
  id: string,
): Promise<{ success: boolean }> {
  return request(`/api/employer/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export { ApiError, getToken, clearToken };
