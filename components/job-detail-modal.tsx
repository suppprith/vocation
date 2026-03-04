"use client";

import { useEffect, useRef } from "react";
import type { Job } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import {
  XMarkIcon,
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const { applications, addApplication } = useAppStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  const isSaved = job ? applications.some((a) => a.job.id === job.id) : false;

  useEffect(() => {
    if (!job) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [job, onClose]);

  if (!job) return null;

  const handleSave = () => {
    if (!isSaved) addApplication(job, "saved");
  };

  const daysAgo = Math.floor(
    (Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  const postedLabel =
    daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[100vh] sm:max-h-[85vh] bg-surface border-t sm:border border-border sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-0">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-base font-bold tracking-tight leading-snug">
              {job.title}
            </h2>
            <p className="text-sm text-muted mt-1">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card transition-all cursor-pointer shrink-0"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 pt-3">
          <Chip icon={<MapPinIcon className="w-3.5 h-3.5" />}>
            {job.location}
          </Chip>
          <Chip icon={<BriefcaseIcon className="w-3.5 h-3.5" />}>
            <span className="capitalize">{job.workArrangement}</span>
            <span className="opacity-40 mx-1">·</span>
            <span className="capitalize">
              {job.employmentType.replace("-", " ")}
            </span>
          </Chip>
          {job.salaryRange && (
            <Chip icon={<CurrencyDollarIcon className="w-3.5 h-3.5" />}>
              {job.salaryRange}
            </Chip>
          )}
          <Chip icon={<BuildingOfficeIcon className="w-3.5 h-3.5" />}>
            <span className="capitalize">{job.companySize}</span>
            <span className="opacity-40 mx-1">·</span>
            {job.industry}
          </Chip>
          <Chip icon={<ClockIcon className="w-3.5 h-3.5" />}>
            {postedLabel}
          </Chip>
        </div>

        {/* Match score */}
        <div className="mx-4 sm:mx-5 mt-3.5 p-3 rounded-xl bg-accent-muted/50 border border-accent/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-accent">
              Match Score
            </span>
            <span className="text-sm font-bold text-accent tabular-nums">
              {job.matchScore}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-accent/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${job.matchScore}%` }}
            />
          </div>
          <p className="text-[11px] text-muted mt-1.5">{job.matchReason}</p>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pt-4 pb-5 space-y-4">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              About this role
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {job.description}
            </p>
          </div>

          {/* Skills */}
          {job.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2.5 px-4 sm:px-5 py-4 border-t border-border bg-surface">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-[0.97] ${
              isSaved
                ? "bg-accent-muted text-accent border border-accent/20"
                : "border border-border hover:bg-card hover:border-border-light"
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            {isSaved ? "Saved" : "Save"}
          </button>
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            Apply
          </a>
        </div>
      </div>
    </div>
  );
}

function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-border rounded-lg text-xs text-muted">
      {icon}
      {children}
    </span>
  );
}
