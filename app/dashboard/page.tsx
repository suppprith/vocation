"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { MOCK_JOBS } from "@/lib/mock-data";
import Link from "next/link";
import {
  BriefcaseIcon,
  SparklesIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  BookmarkIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import type { Job } from "@/lib/types";
import JobDetailModal from "@/components/job-detail-modal";

export default function DashboardPage() {
  const { user, applications, resumeData, addApplication } = useAppStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const topMatches = MOCK_JOBS.slice(0, 4);

  const appliedCount = applications.filter(
    (a) => a.status === "applied",
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status === "interviewing",
  ).length;
  const savedCount = applications.filter((a) => a.status === "saved").length;
  const skillCount = resumeData?.skills?.length || 0;

  const handleSave = (job: Job) => {
    const exists = applications.find((a) => a.job.id === job.id);
    if (!exists) {
      addApplication(job, "saved");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold tracking-tight">
          Hey, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Here&apos;s where things stand.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-8">
        <StatCard label="Saved" value={savedCount} />
        <StatCard label="Applied" value={appliedCount} />
        <StatCard label="Interviews" value={interviewCount} />
        <StatCard label="Skills" value={skillCount} />
      </div>

      {/* Top Matches */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recommended for you</h2>
          <Link
            href="/dashboard/matches"
            className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
          >
            See all
            <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {topMatches.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSave}
              onSelect={() => setSelectedJob(job)}
              isSaved={applications.some((a) => a.job.id === job.id)}
            />
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Quick links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link
            href="/dashboard/feed"
            className="p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all"
          >
            <SparklesIcon className="w-4 h-4 text-accent mb-2" />
            <h3 className="text-xs font-semibold mb-0.5">Browse Jobs</h3>
            <p className="text-[11px] text-muted">
              Search and filter open positions
            </p>
          </Link>
          <Link
            href="/dashboard/tracker"
            className="p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all"
          >
            <RectangleStackIcon className="w-4 h-4 text-accent mb-2" />
            <h3 className="text-xs font-semibold mb-0.5">Job Tracker</h3>
            <p className="text-[11px] text-muted">
              Manage your application pipeline
            </p>
          </Link>
          <Link
            href="/dashboard/profile"
            className="p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all"
          >
            <DocumentTextIcon className="w-4 h-4 text-accent mb-2" />
            <h3 className="text-xs font-semibold mb-0.5">Profile</h3>
            <p className="text-[11px] text-muted">
              Update your skills and preferences
            </p>
          </Link>
        </div>
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3.5 rounded-xl border border-border bg-card">
      <span className="text-[11px] text-muted font-medium">{label}</span>
      <div className="text-xl font-bold tracking-tight mt-1 tabular-nums">
        {value}
      </div>
    </div>
  );
}

function JobCard({
  job,
  onSave,
  onSelect,
  isSaved,
}: {
  job: Job;
  onSave: (job: Job) => void;
  onSelect: () => void;
  isSaved: boolean;
}) {
  return (
    <div
      onClick={onSelect}
      className="p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[13px] truncate">{job.title}</h3>
          <p className="text-xs text-muted mt-0.5">
            {job.company} · {job.location}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(job);
          }}
          disabled={isSaved}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ml-2 ${
            isSaved
              ? "text-accent bg-accent-muted"
              : "text-muted hover:text-accent hover:bg-accent-muted"
          }`}
        >
          <BookmarkIcon className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-muted mb-2.5 line-clamp-2 leading-relaxed">
        {job.description}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="px-2 py-0.5 rounded-md bg-surface-raised text-[11px] text-muted capitalize">
          {job.workArrangement}
        </span>
        {job.salaryRange && (
          <span className="px-2 py-0.5 rounded-md bg-surface-raised text-[11px] text-muted">
            {job.salaryRange}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-md bg-accent-muted text-accent text-[11px] font-semibold tabular-nums ml-auto">
          {job.matchScore}%
        </span>
      </div>
    </div>
  );
}
