"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { JobPostingStatus } from "@/lib/types";
import {
  CheckIcon,
  PlusIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead / Staff" },
  { value: "executive", label: "Executive" },
];

export default function PostJobPage() {
  const router = useRouter();
  const { companyProfile, addJobPosting } = useAppStore();

  // Basic info
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [workArrangement, setWorkArrangement] = useState<
    "remote" | "hybrid" | "onsite"
  >("remote");
  const [employmentType, setEmploymentType] = useState<
    "full-time" | "contract" | "internship" | "part-time"
  >("full-time");
  const [experienceLevel, setExperienceLevel] = useState<
    "entry" | "mid" | "senior" | "lead" | "executive"
  >("mid");

  // Compensation
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Description
  const [summary, setSummary] = useState("");

  // List fields
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [newResponsibility, setNewResponsibility] = useState("");
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [newNiceToHave, setNewNiceToHave] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Application
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationEmail, setApplicationEmail] = useState("");

  const [error, setError] = useState("");

  const addToList = (
    value: string,
    list: string[],
    setter: (v: string[]) => void,
    inputSetter: (v: string) => void,
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setter([...list, trimmed]);
      inputSetter("");
    }
  };

  const removeFromList = (
    item: string,
    list: string[],
    setter: (v: string[]) => void,
  ) => {
    setter(list.filter((x) => x !== item));
  };

  const handleSubmit = (status: JobPostingStatus) => {
    setError("");

    if (!title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (!summary.trim()) {
      setError("Job summary is required.");
      return;
    }
    if (!location.trim()) {
      setError("Location is required.");
      return;
    }

    addJobPosting({
      title: title.trim(),
      department: department.trim() || undefined,
      location: location.trim(),
      workArrangement,
      employmentType,
      salaryMin: salaryMin.trim() || undefined,
      salaryMax: salaryMax.trim() || undefined,
      currency,
      summary: summary.trim(),
      responsibilities,
      requirements,
      niceToHave,
      skills,
      experienceLevel,
      applicationUrl: applicationUrl.trim() || undefined,
      applicationEmail: applicationEmail.trim() || undefined,
      status,
    });

    router.push("/dashboard/listings");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-tight">Post a Job</h1>
        <p className="text-xs text-muted mt-0.5">
          Fill in the details below. You can save as draft or publish right
          away.
        </p>
      </div>

      {!companyProfile && (
        <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 mb-6">
          <p className="text-xs text-warning font-medium">
            Set up your company profile first so your listing shows your company
            info.
          </p>
          <button
            onClick={() => router.push("/dashboard/company")}
            className="text-xs text-accent hover:text-accent-hover mt-1 cursor-pointer font-medium"
          >
            Go to Company Profile →
          </button>
        </div>
      )}

      {error && (
        <div className="px-3.5 py-2.5 rounded-lg bg-danger/8 border border-danger/15 text-danger text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* ── Role details ── */}
        <Section title="Role Details">
          <Field label="Job title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Department">
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
                className="input-field"
              />
            </Field>

            <Field label="Location" required>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="input-field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Arrangement">
              <select
                value={workArrangement}
                onChange={(e) =>
                  setWorkArrangement(
                    e.target.value as "remote" | "hybrid" | "onsite",
                  )
                }
                className="input-field"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </Field>

            <Field label="Employment type">
              <select
                value={employmentType}
                onChange={(e) =>
                  setEmploymentType(
                    e.target.value as
                      | "full-time"
                      | "contract"
                      | "internship"
                      | "part-time",
                  )
                }
                className="input-field"
              >
                <option value="full-time">Full-time</option>
                <option value="contract">Contract</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
              </select>
            </Field>

            <Field label="Experience level">
              <select
                value={experienceLevel}
                onChange={(e) =>
                  setExperienceLevel(
                    e.target.value as
                      | "entry"
                      | "mid"
                      | "senior"
                      | "lead"
                      | "executive",
                  )
                }
                className="input-field"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Compensation ── */}
        <Section title="Compensation">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Salary min">
              <input
                type="text"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="e.g. 120000"
                className="input-field"
              />
            </Field>
            <Field label="Salary max">
              <input
                type="text"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="e.g. 180000"
                className="input-field"
              />
            </Field>
            <Field label="Currency">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
                <option value="CAD">CAD</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Job Description ── */}
        <Section title="Job Description">
          <Field label="Summary" required>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              placeholder="Describe the role, what the person will do day-to-day, and what makes this opportunity interesting."
              className="input-field resize-none"
            />
          </Field>

          <ListField
            label="Responsibilities"
            placeholder="e.g. Own the frontend architecture for our dashboard"
            items={responsibilities}
            value={newResponsibility}
            onChange={setNewResponsibility}
            onAdd={() =>
              addToList(
                newResponsibility,
                responsibilities,
                setResponsibilities,
                setNewResponsibility,
              )
            }
            onRemove={(item) =>
              removeFromList(item, responsibilities, setResponsibilities)
            }
          />

          <ListField
            label="Requirements"
            placeholder="e.g. 3+ years experience with React and TypeScript"
            items={requirements}
            value={newRequirement}
            onChange={setNewRequirement}
            onAdd={() =>
              addToList(
                newRequirement,
                requirements,
                setRequirements,
                setNewRequirement,
              )
            }
            onRemove={(item) =>
              removeFromList(item, requirements, setRequirements)
            }
          />

          <ListField
            label="Nice to have"
            placeholder="e.g. Experience with GraphQL"
            items={niceToHave}
            value={newNiceToHave}
            onChange={setNewNiceToHave}
            onAdd={() =>
              addToList(
                newNiceToHave,
                niceToHave,
                setNiceToHave,
                setNewNiceToHave,
              )
            }
            onRemove={(item) => removeFromList(item, niceToHave, setNiceToHave)}
          />
        </Section>

        {/* ── Skills / Tags ── */}
        <Section title="Skills">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addToList(newSkill, skills, setSkills, setNewSkill);
                }
              }}
              placeholder="e.g. React, Node.js, Figma"
              className="input-field flex-1"
            />
            <button
              onClick={() =>
                addToList(newSkill, skills, setSkills, setNewSkill)
              }
              className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all cursor-pointer active:scale-[0.95]"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-border rounded-lg text-xs"
                >
                  {s}
                  <button
                    onClick={() => removeFromList(s, skills, setSkills)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* ── Application ── */}
        <Section title="How to Apply">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Application URL">
              <input
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://jobs.acme.com/apply"
                className="input-field"
              />
            </Field>
            <Field label="Application email">
              <input
                type="email"
                value={applicationEmail}
                onChange={(e) => setApplicationEmail(e.target.value)}
                placeholder="hiring@acme.com"
                className="input-field"
              />
            </Field>
          </div>
        </Section>

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <button
            onClick={() => handleSubmit("active")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.97]"
          >
            <CheckIcon className="w-4 h-4" />
            Publish
          </button>
          <button
            onClick={() => handleSubmit("draft")}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:bg-card rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-[0.97]"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function ListField({
  label,
  placeholder,
  items,
  value,
  onChange,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  items: string[];
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (item: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <button
          onClick={onAdd}
          className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all cursor-pointer active:scale-[0.95]"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-surface-raised border border-border"
            >
              <span className="text-muted-foreground mt-px">•</span>
              <span className="flex-1">{item}</span>
              <button
                onClick={() => onRemove(item)}
                className="text-muted-foreground hover:text-foreground cursor-pointer mt-px"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
