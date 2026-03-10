export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  onboardingComplete: boolean;
  roles?: string[];
}

export interface ResumeData {
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  rawText?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface WorkStylePreferences {
  collaboration: number; // 1 (independent) to 5 (collaborative)
  structure: number; // 1 (creative freedom) to 5 (structured)
  riskTolerance: number; // 1 (stability) to 5 (risk-taking)
}

export interface HolisticProfile {
  workStyle: WorkStylePreferences;
  passions: string[];
}

export interface CareerPreferences {
  targetRoles: string[];
  preferredIndustries: string[];
  workArrangement: ("remote" | "hybrid" | "onsite")[];
  employmentType: ("full-time" | "contract" | "internship" | "part-time")[];
  companySize: ("startup" | "small" | "medium" | "large" | "enterprise")[];
  salaryMin?: number;
  salaryMax?: number;
  willingToRelocate: boolean;
  availableToStart: string;
}

export interface PortfolioLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  design?: string;
  blog?: string;
  other?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
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

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected";

export interface Application {
  id: string;
  job: Job;
  status: ApplicationStatus;
  notes: string;
  appliedDate?: string;
  updatedDate: string;
}

export const PASSIONS = [
  "Gaming",
  "Writing",
  "Hiking",
  "Design",
  "Technology",
  "Education",
  "Music",
  "Sports",
  "Photography",
  "Cooking",
  "Travel",
  "Art",
  "Science",
  "Finance",
  "Health & Wellness",
  "Social Impact",
  "Film & Media",
  "Robotics",
  "Environment",
  "Fashion",
] as const;

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Entertainment",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media",
  "Gaming",
  "Cybersecurity",
  "AI & Machine Learning",
  "Climate Tech",
  "SaaS",
  "Fintech",
] as const;

export const COMPANY_SIZES = [
  { value: "startup" as const, label: "Startup (1-50)" },
  { value: "small" as const, label: "Small (51-200)" },
  { value: "medium" as const, label: "Medium (201-1000)" },
  { value: "large" as const, label: "Large (1001-5000)" },
  { value: "enterprise" as const, label: "Enterprise (5000+)" },
];

// ── Employer / Company types ────────────────────────────────────────

export interface CompanyProfile {
  name: string;
  website?: string;
  industry: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  location: string;
  description: string;
  culture?: string;
  benefits?: string[];
  techStack?: string[];
  foundedYear?: string;
  linkedinUrl?: string;
}

export type JobPostingStatus = "draft" | "active" | "paused" | "closed";

export interface JobPosting {
  id: string;
  // Basics
  title: string;
  department?: string;
  location: string;
  workArrangement: "remote" | "hybrid" | "onsite";
  employmentType: "full-time" | "contract" | "internship" | "part-time";
  // Compensation
  salaryMin?: string;
  salaryMax?: string;
  currency: string;
  // Description
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  // Skills & tags
  skills: string[];
  experienceLevel: "entry" | "mid" | "senior" | "lead" | "executive";
  // Meta
  applicationUrl?: string;
  applicationEmail?: string;
  status: JobPostingStatus;
  createdDate: string;
  updatedDate: string;
}
