"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { PASSIONS, INDUSTRIES, COMPANY_SIZES } from "@/lib/types";
import {
  UserCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  HeartIcon,
  BriefcaseIcon,
  LinkIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const {
    user,
    resumeData,
    holisticProfile,
    careerPreferences,
    portfolioLinks,
    setResumeData,
    setHolisticProfile,
    setCareerPreferences,
    setPortfolioLinks,
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Editable state
  const [editSkills, setEditSkills] = useState<string[]>(
    resumeData?.skills || [],
  );
  const [newSkill, setNewSkill] = useState("");
  const [editPassions, setEditPassions] = useState<string[]>(
    holisticProfile?.passions || [],
  );
  const [editCollab, setEditCollab] = useState(
    holisticProfile?.workStyle.collaboration || 3,
  );
  const [editStructure, setEditStructure] = useState(
    holisticProfile?.workStyle.structure || 3,
  );
  const [editRisk, setEditRisk] = useState(
    holisticProfile?.workStyle.riskTolerance || 3,
  );
  const [editLinkedin, setEditLinkedin] = useState(
    portfolioLinks?.linkedin || "",
  );
  const [editGithub, setEditGithub] = useState(portfolioLinks?.github || "");
  const [editPortfolio, setEditPortfolio] = useState(
    portfolioLinks?.portfolio || "",
  );
  const [editDesign, setEditDesign] = useState(portfolioLinks?.design || "");
  const [editBlog, setEditBlog] = useState(portfolioLinks?.blog || "");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const saveSkills = () => {
    if (resumeData) {
      setResumeData({ ...resumeData, skills: editSkills });
    } else {
      setResumeData({ skills: editSkills, education: [], experience: [] });
    }
    setActiveSection(null);
  };

  const saveWorkStyle = () => {
    setHolisticProfile({
      workStyle: {
        collaboration: editCollab,
        structure: editStructure,
        riskTolerance: editRisk,
      },
      passions: editPassions,
    });
    setActiveSection(null);
  };

  const saveLinks = () => {
    setPortfolioLinks({
      linkedin: editLinkedin,
      github: editGithub,
      portfolio: editPortfolio,
      design: editDesign,
      blog: editBlog,
    });
    setActiveSection(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold tracking-tight">Profile</h1>
        <p className="text-xs text-muted mt-0.5">
          Your skills, preferences, and links.
        </p>
      </div>

      {/* User Card */}
      <div className="p-5 rounded-2xl border border-border bg-card mb-6 animate-fadeIn">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-muted flex items-center justify-center">
            <span className="text-xl font-bold text-accent">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold">{user?.name || "User"}</h2>
            <p className="text-xs text-muted">{user?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <ProfileSection
        icon={DocumentTextIcon}
        title="Skills & Experience"
        description="What you know and what you've done"
        isOpen={activeSection === "skills"}
        onToggle={() => toggleSection("skills")}
      >
        {activeSection === "skills" ? (
          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSkill.trim()) {
                    e.preventDefault();
                    setEditSkills([...editSkills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 bg-input border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent transition-all"
              />
              <button
                onClick={() => {
                  if (newSkill.trim()) {
                    setEditSkills([...editSkills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
                className="px-3 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all cursor-pointer active:scale-[0.95]"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {editSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-border rounded-xl text-[13px]"
                >
                  {skill}
                  <button
                    onClick={() =>
                      setEditSkills(editSkills.filter((s) => s !== skill))
                    }
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={saveSkills}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-[13px] font-semibold transition-all cursor-pointer active:scale-[0.97]"
            >
              <CheckIcon className="w-4 h-4" />
              Save
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(resumeData?.skills || []).length > 0 ? (
              resumeData?.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-surface-raised border border-border rounded-xl text-[13px]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No skills added yet.
              </p>
            )}
          </div>
        )}
      </ProfileSection>

      {/* Work Style & Passions */}
      <ProfileSection
        icon={SparklesIcon}
        title="Work Style & Passions"
        description="How you work and what you care about"
        isOpen={activeSection === "workstyle"}
        onToggle={() => toggleSection("workstyle")}
      >
        {activeSection === "workstyle" ? (
          <div>
            <div className="space-y-6 mb-6">
              <MiniSlider
                label="Collaboration"
                leftLabel="Independent"
                rightLabel="Collaborative"
                value={editCollab}
                onChange={setEditCollab}
              />
              <MiniSlider
                label="Structure"
                leftLabel="Creative Freedom"
                rightLabel="Structured"
                value={editStructure}
                onChange={setEditStructure}
              />
              <MiniSlider
                label="Risk"
                leftLabel="Stability"
                rightLabel="Risk-taking"
                value={editRisk}
                onChange={setEditRisk}
              />
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold mb-2">
                Passions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PASSIONS.map((passion) => (
                  <button
                    key={passion}
                    onClick={() =>
                      setEditPassions(
                        editPassions.includes(passion)
                          ? editPassions.filter((p) => p !== passion)
                          : [...editPassions, passion],
                      )
                    }
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-[0.95] ${
                      editPassions.includes(passion)
                        ? "border-accent bg-accent-muted text-accent"
                        : "border-border bg-surface hover:bg-card-hover"
                    }`}
                  >
                    {passion}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={saveWorkStyle}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-[13px] font-semibold transition-all cursor-pointer active:scale-[0.97]"
            >
              <CheckIcon className="w-4 h-4" />
              Save
            </button>
          </div>
        ) : (
          <div>
            {holisticProfile ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <StyleStat
                    label="Collaboration"
                    value={holisticProfile.workStyle.collaboration}
                  />
                  <StyleStat
                    label="Structure"
                    value={holisticProfile.workStyle.structure}
                  />
                  <StyleStat
                    label="Risk Tolerance"
                    value={holisticProfile.workStyle.riskTolerance}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {holisticProfile.passions.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 bg-accent-muted text-accent rounded-xl text-xs font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Not configured yet.
              </p>
            )}
          </div>
        )}
      </ProfileSection>

      {/* Career Preferences */}
      <ProfileSection
        icon={BriefcaseIcon}
        title="Career Preferences"
        description="What you're looking for"
        isOpen={activeSection === "career"}
        onToggle={() => toggleSection("career")}
      >
        {careerPreferences ? (
          <div className="space-y-3">
            {careerPreferences.targetRoles.length > 0 && (
              <div>
                <span className="text-xs text-muted font-medium">
                  Target Roles
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {careerPreferences.targetRoles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 bg-surface-raised border border-border rounded-lg text-xs"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {careerPreferences.preferredIndustries.length > 0 && (
              <div>
                <span className="text-xs text-muted font-medium">
                  Industries
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {careerPreferences.preferredIndustries.map((i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-surface-raised border border-border rounded-lg text-xs"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {careerPreferences.workArrangement.length > 0 && (
                <div>
                  <span className="text-xs text-muted font-medium">
                    Arrangement
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    {careerPreferences.workArrangement.map((w) => (
                      <span
                        key={w}
                        className="px-2 py-0.5 bg-accent-muted text-accent rounded-lg text-xs capitalize"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {careerPreferences.employmentType.length > 0 && (
                <div>
                  <span className="text-xs text-muted font-medium">Type</span>
                  <div className="flex gap-1.5 mt-1">
                    {careerPreferences.employmentType.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-accent-muted text-accent rounded-lg text-xs capitalize"
                      >
                        {t.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Not configured yet.</p>
        )}
      </ProfileSection>

      {/* Portfolio Links */}
      <ProfileSection
        icon={LinkIcon}
        title="Portfolio & Links"
        description="Your online presence"
        isOpen={activeSection === "links"}
        onToggle={() => toggleSection("links")}
      >
        {activeSection === "links" ? (
          <div>
            <div className="space-y-3 mb-4">
              {[
                {
                  label: "LinkedIn",
                  value: editLinkedin,
                  setter: setEditLinkedin,
                },
                { label: "GitHub", value: editGithub, setter: setEditGithub },
                {
                  label: "Portfolio",
                  value: editPortfolio,
                  setter: setEditPortfolio,
                },
                { label: "Design", value: editDesign, setter: setEditDesign },
                { label: "Blog", value: editBlog, setter: setEditBlog },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-muted mb-1">
                    {field.label}
                  </label>
                  <input
                    type="url"
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={`https://...`}
                    className="w-full px-3 py-2 bg-input border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent transition-all"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={saveLinks}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-[13px] font-semibold transition-all cursor-pointer active:scale-[0.97]"
            >
              <CheckIcon className="w-4 h-4" />
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {portfolioLinks &&
            Object.entries(portfolioLinks).some(([, v]) => v) ? (
              Object.entries(portfolioLinks)
                .filter(([, v]) => v)
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-accent hover:text-accent-hover truncate transition-colors"
                    >
                      {value}
                    </a>
                  </div>
                ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No links added yet.
              </p>
            )}
          </div>
        )}
      </ProfileSection>
    </div>
  );
}

function ProfileSection({
  icon: Icon,
  title,
  description,
  isOpen,
  onToggle,
  children,
}: {
  icon: typeof DocumentTextIcon;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-2xl border border-border bg-card overflow-hidden animate-fadeIn">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-card-hover transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-muted flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="text-left">
            <h3 className="text-[13px] font-semibold">{title}</h3>
            <p className="text-xs text-muted">{description}</p>
          </div>
        </div>
        <PencilIcon className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

function MiniSlider({
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
      <label className="block text-xs font-semibold mb-2">{label}</label>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-[10px] text-muted w-16 sm:w-20 text-right shrink-0">
          {leftLabel}
        </span>
        <div className="flex-1 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`flex-1 h-8 rounded-xl border text-xs font-medium transition-all cursor-pointer active:scale-[0.93] ${
                v === value
                  ? "border-accent bg-accent text-white shadow-md shadow-accent/20"
                  : v < value
                    ? "border-accent/30 bg-accent-muted text-accent"
                    : "border-border bg-surface hover:bg-card-hover text-muted"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted w-16 sm:w-20 shrink-0">{rightLabel}</span>
      </div>
    </div>
  );
}

function StyleStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 rounded-xl bg-surface-raised border border-border">
      <span className="text-[10px] text-muted font-medium block mb-1.5">
        {label}
      </span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <div
            key={v}
            className={`h-1.5 flex-1 rounded-full ${
              v <= value ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
