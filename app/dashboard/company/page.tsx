"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { INDUSTRIES, COMPANY_SIZES } from "@/lib/types";
import {
  BuildingOffice2Icon,
  CheckIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function CompanyPage() {
  const { companyProfile, setCompanyProfile } = useAppStore();

  const [name, setName] = useState(companyProfile?.name || "");
  const [website, setWebsite] = useState(companyProfile?.website || "");
  const [industry, setIndustry] = useState(companyProfile?.industry || "");
  const [size, setSize] = useState(companyProfile?.size || "");
  const [location, setLocation] = useState(companyProfile?.location || "");
  const [description, setDescription] = useState(
    companyProfile?.description || "",
  );
  const [culture, setCulture] = useState(companyProfile?.culture || "");
  const [benefits, setBenefits] = useState<string[]>(
    companyProfile?.benefits || [],
  );
  const [newBenefit, setNewBenefit] = useState("");
  const [techStack, setTechStack] = useState<string[]>(
    companyProfile?.techStack || [],
  );
  const [newTech, setNewTech] = useState("");
  const [foundedYear, setFoundedYear] = useState(
    companyProfile?.foundedYear || "",
  );
  const [linkedinUrl, setLinkedinUrl] = useState(
    companyProfile?.linkedinUrl || "",
  );

  const [saved, setSaved] = useState(false);

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };

  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    setCompanyProfile({
      name: name.trim(),
      website: website.trim() || undefined,
      industry,
      size: size as "startup" | "small" | "medium" | "large" | "enterprise",
      location: location.trim(),
      description: description.trim(),
      culture: culture.trim() || undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      techStack: techStack.length > 0 ? techStack : undefined,
      foundedYear: foundedYear.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-tight">Company Profile</h1>
        <p className="text-xs text-muted mt-0.5">
          Set up your company so candidates know who you are.
        </p>
      </div>

      <div className="space-y-5">
        {/* Basic info */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Basic Information
          </h2>

          <Field label="Company name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Inc."
              className="input-field"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="input-field"
              >
                <option value="">Select</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Company size">
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="input-field"
              >
                <option value="">Select</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Headquarters">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="input-field"
              />
            </Field>

            <Field label="Founded year">
              <input
                type="text"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                placeholder="2020"
                className="input-field"
              />
            </Field>
          </div>

          <Field label="Website">
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://acme.com"
              className="input-field"
            />
          </Field>

          <Field label="LinkedIn">
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/company/acme"
              className="input-field"
            />
          </Field>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
            About
          </h2>

          <Field label="Company description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does your company do? Keep it brief."
              className="input-field resize-none"
            />
          </Field>

          <Field label="Culture & values">
            <textarea
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              rows={2}
              placeholder="What's it like to work at your company?"
              className="input-field resize-none"
            />
          </Field>
        </section>

        {/* Benefits */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Benefits & Perks
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addBenefit();
                }
              }}
              placeholder="e.g. Health insurance, 401k match"
              className="input-field flex-1"
            />
            <button
              onClick={addBenefit}
              className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all cursor-pointer active:scale-[0.95]"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          {benefits.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {benefits.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-border rounded-lg text-xs"
                >
                  {b}
                  <button
                    onClick={() => setBenefits(benefits.filter((x) => x !== b))}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Tech Stack */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Tech Stack
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTech();
                }
              }}
              placeholder="e.g. React, PostgreSQL, AWS"
              className="input-field flex-1"
            />
            <button
              onClick={addTech}
              className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-all cursor-pointer active:scale-[0.95]"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-border rounded-lg text-xs"
                >
                  {t}
                  <button
                    onClick={() =>
                      setTechStack(techStack.filter((x) => x !== t))
                    }
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Save */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.97]"
          >
            <CheckIcon className="w-4 h-4" />
            {saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
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
