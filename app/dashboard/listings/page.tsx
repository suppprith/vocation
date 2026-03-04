"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { JobPosting, JobPostingStatus } from "@/lib/types";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  XCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const STATUS_CONFIG: Record<
  JobPostingStatus,
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "bg-muted/20 text-muted" },
  active: { label: "Active", color: "bg-green-500/15 text-green-400" },
  paused: { label: "Paused", color: "bg-yellow-500/15 text-yellow-400" },
  closed: { label: "Closed", color: "bg-red-500/15 text-red-400" },
};

export default function ListingsPage() {
  const router = useRouter();
  const { jobPostings, updateJobPostingStatus, removeJobPosting } =
    useAppStore();
  const [filter, setFilter] = useState<JobPostingStatus | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? jobPostings
      : jobPostings.filter((j) => j.status === filter);

  const counts = {
    all: jobPostings.length,
    active: jobPostings.filter((j) => j.status === "active").length,
    draft: jobPostings.filter((j) => j.status === "draft").length,
    paused: jobPostings.filter((j) => j.status === "paused").length,
    closed: jobPostings.filter((j) => j.status === "closed").length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="flex items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Job Listings</h1>
          <p className="text-xs text-muted mt-0.5">
            {jobPostings.length} listing{jobPostings.length !== 1 && "s"} total
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/post-job")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.97]"
        >
          <PlusIcon className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
        {(["all", "active", "draft", "paused", "closed"] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filter === status
                  ? "bg-accent text-white"
                  : "bg-card hover:bg-surface-raised text-muted-foreground"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status].label}
              <span className="ml-1.5 opacity-70">{counts[status]}</span>
            </button>
          ),
        )}
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted">
            {filter === "all"
              ? "No job listings yet. Create your first one."
              : `No ${filter} listings.`}
          </p>
          {filter === "all" && (
            <button
              onClick={() => router.push("/dashboard/post-job")}
              className="text-sm text-accent hover:text-accent-hover mt-2 cursor-pointer font-medium"
            >
              Post a Job →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((job) => (
            <ListingCard
              key={job.id}
              job={job}
              onStatusChange={(status) =>
                updateJobPostingStatus(job.id, status)
              }
              onDelete={() => {
                if (confirmDelete === job.id) {
                  removeJobPosting(job.id);
                  setConfirmDelete(null);
                } else {
                  setConfirmDelete(job.id);
                  setTimeout(() => setConfirmDelete(null), 3000);
                }
              }}
              isConfirmingDelete={confirmDelete === job.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({
  job,
  onStatusChange,
  onDelete,
  isConfirmingDelete,
}: {
  job: JobPosting;
  onStatusChange: (status: JobPostingStatus) => void;
  onDelete: () => void;
  isConfirmingDelete: boolean;
}) {
  const cfg = STATUS_CONFIG[job.status];
  const postedDate = new Date(job.createdDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/20 transition-all">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold truncate">{job.title}</h3>
          <span
            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs text-muted flex-wrap">
          <span>{job.location}</span>
          <span className="opacity-40">·</span>
          <span className="capitalize">
            {job.workArrangement} · {job.employmentType}
          </span>
          {job.salaryMin && job.salaryMax && (
            <>
              <span className="opacity-40">·</span>
              <span>
                {job.currency} {Number(job.salaryMin).toLocaleString()}–
                {Number(job.salaryMax).toLocaleString()}
              </span>
            </>
          )}
          <span className="opacity-40">·</span>
          <span>{postedDate}</span>
        </div>
        {job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {job.skills.slice(0, 5).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-surface-raised border border-border rounded-md text-[10px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2 py-0.5 text-[10px] text-muted">
                +{job.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {job.status === "draft" && (
          <ActionBtn title="Publish" onClick={() => onStatusChange("active")}>
            <PlayCircleIcon className="w-4 h-4" />
          </ActionBtn>
        )}
        {job.status === "active" && (
          <ActionBtn title="Pause" onClick={() => onStatusChange("paused")}>
            <PauseCircleIcon className="w-4 h-4" />
          </ActionBtn>
        )}
        {job.status === "paused" && (
          <ActionBtn title="Resume" onClick={() => onStatusChange("active")}>
            <PlayCircleIcon className="w-4 h-4" />
          </ActionBtn>
        )}
        {(job.status === "active" || job.status === "paused") && (
          <ActionBtn title="Close" onClick={() => onStatusChange("closed")}>
            <XCircleIcon className="w-4 h-4" />
          </ActionBtn>
        )}
        {job.status === "closed" && (
          <ActionBtn title="Reopen" onClick={() => onStatusChange("active")}>
            <PlayCircleIcon className="w-4 h-4" />
          </ActionBtn>
        )}
        <ActionBtn
          title={isConfirmingDelete ? "Confirm delete" : "Delete"}
          className={
            isConfirmingDelete
              ? "!text-red-400 !bg-red-500/10 !border-red-500/20"
              : ""
          }
          onClick={onDelete}
        >
          <TrashIcon className="w-4 h-4" />
        </ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({
  title,
  onClick,
  className = "",
  children,
}: {
  title: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-transparent hover:border-border transition-all cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
