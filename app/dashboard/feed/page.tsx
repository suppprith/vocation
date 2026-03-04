"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { MOCK_JOBS } from "@/lib/mock-data";
import { INDUSTRIES } from "@/lib/types";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { Job } from "@/lib/types";

export default function JobFeedPage() {
  const { applications, addApplication } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [filterArrangement, setFilterArrangement] = useState<string>("");
  const [filterSize, setFilterSize] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      const matchesSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase()) ||
        job.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesIndustry =
        !filterIndustry || job.industry === filterIndustry;
      const matchesArrangement =
        !filterArrangement || job.workArrangement === filterArrangement;
      const matchesSize = !filterSize || job.companySize === filterSize;

      return (
        matchesSearch && matchesIndustry && matchesArrangement && matchesSize
      );
    });
  }, [search, filterIndustry, filterArrangement, filterSize]);

  const handleSave = (job: Job) => {
    const exists = applications.find((a) => a.job.id === job.id);
    if (!exists) {
      addApplication(job, "saved");
    }
  };

  const activeFilterCount = [
    filterIndustry,
    filterArrangement,
    filterSize,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterIndustry("");
    setFilterArrangement("");
    setFilterSize("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold tracking-tight mb-0.5">Job Feed</h1>
        <p className="text-xs text-muted">
          {filteredJobs.length}{" "}
          {filteredJobs.length === 1 ? "position" : "positions"} available
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, companies, skills..."
            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all cursor-pointer active:scale-[0.97] ${
            showFilters || activeFilterCount > 0
              ? "border-accent bg-accent-muted text-accent"
              : "border-border hover:bg-card hover:border-border-light"
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-lg bg-accent text-white text-[11px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 rounded-2xl border border-border bg-card mb-6 animate-scaleIn">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold">Filters</span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer flex items-center gap-1"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Industry
              </label>
              <select
                value={filterIndustry}
                onChange={(e) => setFilterIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent cursor-pointer transition-all"
              >
                <option value="">All industries</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Arrangement
              </label>
              <select
                value={filterArrangement}
                onChange={(e) => setFilterArrangement(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent cursor-pointer transition-all"
              >
                <option value="">All arrangements</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Company Size
              </label>
              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-accent-muted focus:border-accent cursor-pointer transition-all"
              >
                <option value="">All sizes</option>
                <option value="startup">Startup</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {filteredJobs.map((job, i) => {
          const isSaved = applications.some((a) => a.job.id === job.id);
          return (
            <div
              key={job.id}
              className={`p-4 rounded-2xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all animate-fadeIn stagger-${Math.min(i + 1, 5)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[13px] mb-0.5 truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted">
                    {job.company} · {job.location} · {job.industry}
                  </p>
                </div>
                <span className="ml-3 px-2 py-0.5 rounded-lg bg-accent-muted text-accent text-xs font-bold tabular-nums shrink-0">
                  {job.matchScore}%
                </span>
              </div>
              <p className="text-xs text-muted mb-3 line-clamp-2 leading-relaxed">
                {job.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-surface-raised border border-border text-[11px] text-muted capitalize">
                    {job.workArrangement}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-surface-raised border border-border text-[11px] text-muted capitalize">
                    {job.employmentType.replace("-", " ")}
                  </span>
                  {job.salaryRange && (
                    <span className="px-2 py-0.5 rounded-lg bg-surface-raised border border-border text-[11px] text-muted">
                      {job.salaryRange}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSave(job)}
                    disabled={isSaved}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer active:scale-[0.93] ${
                      isSaved
                        ? "text-accent bg-accent-muted"
                        : "text-muted hover:text-accent hover:bg-accent-muted"
                    }`}
                    title={isSaved ? "Saved" : "Save job"}
                  >
                    <BookmarkIcon className="w-4 h-4" />
                  </button>
                  <a
                    href={job.applyUrl}
                    className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-muted transition-all"
                    title="Apply"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 text-muted">
            <MagnifyingGlassIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-[13px] mb-1">No jobs found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
