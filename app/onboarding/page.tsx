"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { PASSIONS, INDUSTRIES, COMPANY_SIZES } from "@/lib/types";
import {
  DocumentArrowUpIcon,
  PlusIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  SparklesIcon,
  HeartIcon,
  BriefcaseIcon,
  LinkIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const STEPS = [
  { label: "Resume", icon: DocumentTextIcon },
  { label: "Work Style", icon: SparklesIcon },
  { label: "Passions", icon: HeartIcon },
  { label: "Preferences", icon: BriefcaseIcon },
  { label: "Portfolio", icon: LinkIcon },
];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    setResumeData,
    setHolisticProfile,
    setCareerPreferences,
    setPortfolioLinks,
    completeOnboarding,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router]);

  // Step 0: Resume
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [education, setEducation] = useState([
    { institution: "", degree: "", field: "", year: "" },
  ]);
  const [experience, setExperience] = useState([
    { company: "", role: "", duration: "", description: "" },
  ]);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  // Step 1: Work Style
  const [collaboration, setCollaboration] = useState(3);
  const [structure, setStructure] = useState(3);
  const [riskTolerance, setRiskTolerance] = useState(3);

  // Step 2: Passions
  const [selectedPassions, setSelectedPassions] = useState<string[]>([]);

  // Step 3: Career Preferences
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState("");
  const [preferredIndustries, setPreferredIndustries] = useState<string[]>([]);
  const [workArrangement, setWorkArrangement] = useState<string[]>([]);
  const [employmentType, setEmploymentType] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [availableToStart, setAvailableToStart] = useState("");

  // Step 4: Portfolio
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [design, setDesign] = useState("");
  const [blog, setBlog] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addRole = () => {
    if (newRole.trim() && !targetRoles.includes(newRole.trim())) {
      setTargetRoles([...targetRoles, newRole.trim()]);
      setNewRole("");
    }
  };

  const togglePassion = (passion: string) => {
    setSelectedPassions((prev) =>
      prev.includes(passion)
        ? prev.filter((p) => p !== passion)
        : [...prev, passion],
    );
  };

  const toggleIndustry = (industry: string) => {
    setPreferredIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry],
    );
  };

  const toggleArray = (
    arr: string[],
    value: string,
    setter: (v: string[]) => void,
  ) => {
    setter(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setResumeUploaded(true);
        setSkills(["JavaScript", "TypeScript", "React", "Node.js", "Python"]);
        setEducation([
          {
            institution: "University of Technology",
            degree: "Bachelor of Science",
            field: "Computer Science",
            year: "2022",
          },
        ]);
        setExperience([
          {
            company: "Tech Corp",
            role: "Software Engineer",
            duration: "2022 - Present",
            description:
              "Built and maintained web applications using React and Node.js.",
          },
        ]);
      }
    },
    [],
  );

  const handleNext = () => {
    if (step === 0) {
      setResumeData({ skills, education, experience });
    } else if (step === 2) {
      setHolisticProfile({
        workStyle: { collaboration, structure, riskTolerance },
        passions: selectedPassions,
      });
    } else if (step === 3) {
      setCareerPreferences({
        targetRoles,
        preferredIndustries,
        workArrangement: workArrangement as ("remote" | "hybrid" | "onsite")[],
        employmentType: employmentType as (
          | "full-time"
          | "contract"
          | "internship"
          | "part-time"
        )[],
        companySize: companySize as (
          | "startup"
          | "small"
          | "medium"
          | "large"
          | "enterprise"
        )[],
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        willingToRelocate,
        availableToStart,
      });
    }
    if (step < 4) setStep(step + 1);
  };

  const handleComplete = () => {
    setPortfolioLinks({ linkedin, github, portfolio, design, blog });
    completeOnboarding();
    router.push("/dashboard");
  };

  if (!mounted) return null;

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm px-6 py-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Vocation" width={26} height={26} />
            <span className="font-bold tracking-tight text-sm">Vocation</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-medium">
              {step + 1} / {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-0.5 bg-border">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="border-b border-border px-6 py-3 bg-surface/30">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    i === step
                      ? "bg-accent-muted text-accent"
                      : i < step
                        ? "text-accent cursor-pointer hover:bg-accent-muted/50"
                        : "text-muted-foreground cursor-default"
                  }`}
                >
                  {i < step ? (
                    <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                      <CheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px transition-colors ${
                      i < step ? "bg-accent/40" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto animate-fadeIn" key={step}>
          {/* Step 0: Resume */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Your professional foundation
              </h2>
              <p className="text-muted text-sm mb-8 max-w-lg">
                Upload your resume or manually enter your skills, education, and
                experience.
              </p>

              {/* Upload */}
              <div className="mb-8">
                <label className="block">
                  <div
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                      resumeUploaded
                        ? "border-accent bg-accent-muted/30"
                        : "border-border-light hover:border-accent/40 hover:bg-accent-glow"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {resumeUploaded ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <CheckIcon className="w-6 h-6 text-accent" />
                        </div>
                        <span className="text-accent font-semibold text-sm">
                          Resume analyzed
                        </span>
                        <span className="text-xs text-muted">
                          Skills and experience extracted below
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center">
                          <DocumentArrowUpIcon className="w-6 h-6 text-muted" />
                        </div>
                        <span className="text-foreground font-semibold text-sm">
                          Upload your resume
                        </span>
                        <span className="text-xs text-muted">
                          PDF, DOC, DOCX, or TXT
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Skills
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    placeholder="Add a skill..."
                    className="flex-1 px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all"
                  />
                  <button
                    onClick={addSkill}
                    className="px-3.5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border rounded-lg text-sm animate-scaleIn"
                    >
                      {skill}
                      <button
                        onClick={() =>
                          setSkills(skills.filter((s) => s !== skill))
                        }
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-8">
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <AcademicCapIcon className="w-4 h-4 text-muted" />
                  Education
                </label>
                {education.map((edu, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 gap-3 mb-3 p-4 bg-card border border-border rounded-2xl"
                  >
                    <input
                      value={edu.institution}
                      onChange={(e) => {
                        const u = [...education];
                        u[i].institution = e.target.value;
                        setEducation(u);
                      }}
                      placeholder="Institution"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                    <input
                      value={edu.degree}
                      onChange={(e) => {
                        const u = [...education];
                        u[i].degree = e.target.value;
                        setEducation(u);
                      }}
                      placeholder="Degree"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                    <input
                      value={edu.field}
                      onChange={(e) => {
                        const u = [...education];
                        u[i].field = e.target.value;
                        setEducation(u);
                      }}
                      placeholder="Field of study"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                    <input
                      value={edu.year}
                      onChange={(e) => {
                        const u = [...education];
                        u[i].year = e.target.value;
                        setEducation(u);
                      }}
                      placeholder="Year"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setEducation([
                      ...education,
                      { institution: "", degree: "", field: "", year: "" },
                    ])
                  }
                  className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add education
                </button>
              </div>

              {/* Experience */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <BuildingOfficeIcon className="w-4 h-4 text-muted" />
                  Work Experience
                </label>
                {experience.map((exp, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 gap-3 mb-3 p-4 bg-card border border-border rounded-2xl"
                  >
                    <input
                      value={exp.company}
                      onChange={(e) => {
                        const u = [...experience];
                        u[i].company = e.target.value;
                        setExperience(u);
                      }}
                      placeholder="Company"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                    <input
                      value={exp.role}
                      onChange={(e) => {
                        const u = [...experience];
                        u[i].role = e.target.value;
                        setExperience(u);
                      }}
                      placeholder="Role"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                    <input
                      value={exp.duration}
                      onChange={(e) => {
                        const u = [...experience];
                        u[i].duration = e.target.value;
                        setExperience(u);
                      }}
                      placeholder="Duration"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                    <input
                      value={exp.description}
                      onChange={(e) => {
                        const u = [...experience];
                        u[i].description = e.target.value;
                        setExperience(u);
                      }}
                      placeholder="Description"
                      className="px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setExperience([
                      ...experience,
                      { company: "", role: "", duration: "", description: "" },
                    ])
                  }
                  className="text-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <PlusIcon className="w-3.5 h-3.5" /> Add experience
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Work Style */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                How do you prefer to work?
              </h2>
              <p className="text-muted text-sm mb-10 max-w-lg">
                These preferences help us understand the environments where you
                perform best.
              </p>

              <div className="space-y-10">
                <SliderQuestion
                  label="Collaboration Style"
                  leftLabel="Independent"
                  rightLabel="Collaborative"
                  value={collaboration}
                  onChange={setCollaboration}
                />
                <SliderQuestion
                  label="Work Environment"
                  leftLabel="Creative Freedom"
                  rightLabel="Structured"
                  value={structure}
                  onChange={setStructure}
                />
                <SliderQuestion
                  label="Risk Tolerance"
                  leftLabel="Stability"
                  rightLabel="Risk-taking"
                  value={riskTolerance}
                  onChange={setRiskTolerance}
                />
              </div>
            </div>
          )}

          {/* Step 2: Passions */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                What are you passionate about?
              </h2>
              <p className="text-muted text-sm mb-8 max-w-lg">
                Select interests that matter to you. These help us find
                industries and roles that feel meaningful.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {PASSIONS.map((passion) => (
                  <button
                    key={passion}
                    onClick={() => togglePassion(passion)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      selectedPassions.includes(passion)
                        ? "border-accent bg-accent-muted text-accent shadow-sm shadow-accent/10"
                        : "border-border bg-card hover:bg-card-hover text-foreground hover:border-border-light"
                    }`}
                  >
                    {passion}
                  </button>
                ))}
              </div>

              {selectedPassions.length > 0 && (
                <p className="text-xs text-muted mt-4">
                  {selectedPassions.length} selected
                </p>
              )}
            </div>
          )}

          {/* Step 3: Career Preferences */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                What are you looking for?
              </h2>
              <p className="text-muted text-sm mb-8 max-w-lg">
                Define the types of opportunities that interest you.
              </p>

              {/* Target Roles */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Target Roles
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addRole())
                    }
                    placeholder="e.g. Software Engineer, Product Designer..."
                    className="flex-1 px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all"
                  />
                  <button
                    onClick={addRole}
                    className="px-3.5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targetRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border rounded-lg text-sm animate-scaleIn"
                    >
                      {role}
                      <button
                        onClick={() =>
                          setTargetRoles(targetRoles.filter((r) => r !== role))
                        }
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Preferred Industries
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer ${
                        preferredIndustries.includes(industry)
                          ? "border-accent bg-accent-muted text-accent"
                          : "border-border bg-card hover:bg-card-hover"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Arrangement */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Work Arrangement
                </label>
                <div className="flex gap-2">
                  {["remote", "hybrid", "onsite"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        toggleArray(workArrangement, opt, setWorkArrangement)
                      }
                      className={`px-4 py-2.5 rounded-xl border text-sm capitalize font-medium transition-all cursor-pointer flex-1 ${
                        workArrangement.includes(opt)
                          ? "border-accent bg-accent-muted text-accent"
                          : "border-border bg-card hover:bg-card-hover"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Employment Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {["full-time", "contract", "internship", "part-time"].map(
                    (opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          toggleArray(employmentType, opt, setEmploymentType)
                        }
                        className={`px-4 py-2.5 rounded-xl border text-sm capitalize font-medium transition-all cursor-pointer ${
                          employmentType.includes(opt)
                            ? "border-accent bg-accent-muted text-accent"
                            : "border-border bg-card hover:bg-card-hover"
                        }`}
                      >
                        {opt.replace("-", " ")}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Company Size */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Company Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_SIZES.map((cs) => (
                    <button
                      key={cs.value}
                      onClick={() =>
                        toggleArray(companySize, cs.value, setCompanySize)
                      }
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                        companySize.includes(cs.value)
                          ? "border-accent bg-accent-muted text-accent"
                          : "border-border bg-card hover:bg-card-hover"
                      }`}
                    >
                      {cs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Expected Salary Range (optional)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Min"
                    className="w-36 px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                  />
                  <span className="text-xs text-muted font-medium">to</span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Max"
                    className="w-36 px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              {/* Relocate & Start */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Willing to Relocate
                  </label>
                  <button
                    onClick={() => setWillingToRelocate(!willingToRelocate)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      willingToRelocate
                        ? "border-accent bg-accent-muted text-accent"
                        : "border-border bg-card hover:bg-card-hover"
                    }`}
                  >
                    {willingToRelocate ? "Yes" : "No"}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3">
                    Available to Start
                  </label>
                  <input
                    type="text"
                    value={availableToStart}
                    onChange={(e) => setAvailableToStart(e.target.value)}
                    placeholder="e.g. Immediately, 2 weeks..."
                    className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Portfolio */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Link your professional presence
              </h2>
              <p className="text-muted text-sm mb-8 max-w-lg">
                Add links to your profiles and portfolios. This helps provide
                evidence of your work beyond a resume.
              </p>

              <div className="space-y-5">
                {[
                  {
                    label: "LinkedIn",
                    value: linkedin,
                    setter: setLinkedin,
                    placeholder: "https://linkedin.com/in/...",
                  },
                  {
                    label: "GitHub",
                    value: github,
                    setter: setGithub,
                    placeholder: "https://github.com/...",
                  },
                  {
                    label: "Portfolio Website",
                    value: portfolio,
                    setter: setPortfolio,
                    placeholder: "https://yoursite.com",
                  },
                  {
                    label: "Design Portfolio",
                    value: design,
                    setter: setDesign,
                    placeholder: "https://dribbble.com/...",
                  },
                  {
                    label: "Blog / Writing",
                    value: blog,
                    setter: setBlog,
                    placeholder: "https://blog.example.com",
                  },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold mb-2 text-muted">
                      {field.label}
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="border-t border-border bg-surface/50 backdrop-blur-sm px-6 py-4 sticky bottom-0 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              step === 0
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-foreground hover:bg-card"
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Continue
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Complete Setup
              <CheckIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderQuestion({
  label,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-4">{label}</label>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted w-24 text-right font-medium">
          {leftLabel}
        </span>
        <div className="flex-1 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`flex-1 h-11 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                v === value
                  ? "border-accent bg-accent text-white shadow-md shadow-accent/20"
                  : v < value
                    ? "border-accent/30 bg-accent-muted text-accent"
                    : "border-border bg-card hover:bg-card-hover text-muted"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted w-24 font-medium">
          {rightLabel}
        </span>
      </div>
    </div>
  );
}
