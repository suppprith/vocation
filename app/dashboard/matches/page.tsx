"use client";

import { useAppStore } from "@/lib/store";
import { MOCK_JOBS } from "@/lib/mock-data";
import {
  SparklesIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import type { Job } from "@/lib/types";

export default function MatchesPage() {
  const { applications, addApplication } = useAppStore();
  const jobs = [...MOCK_JOBS].sort((a, b) => b.matchScore - a.matchScore);

  const handleSave = (job: Job) => {
    const exists = applications.find((a) => a.job.id === job.id);
    if (!exists) {
      addApplication(job, "saved");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold tracking-tight">Matches</h1>
        <p className="text-xs text-muted mt-0.5">
          {jobs.length} jobs ranked by fit
        </p>
      </div>

      <div className="space-y-2.5">
        {jobs.map((job) => {
          const isSaved = applications.some((a) => a.job.id === job.id);
          return (
            <div
              key={job.id}
              className="p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[13px] truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    {job.company} · {job.location}
                  </p>
                </div>
                <span className="ml-3 px-2 py-0.5 rounded-lg bg-accent-muted text-accent text-xs font-bold tabular-nums shrink-0">
                  {job.matchScore}%
                </span>
              </div>

              <p className="text-xs text-muted mb-2 leading-relaxed">
                {job.description}
              </p>

              {/* Why it matched */}
              <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                {job.matchReason}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                {job.skills.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-surface-raised text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
                <span className="px-2 py-0.5 rounded-md bg-surface-raised text-[11px] text-muted capitalize">
                  {job.workArrangement}
                </span>
                {job.salaryRange && (
                  <span className="px-2 py-0.5 rounded-md bg-surface-raised text-[11px] text-muted">
                    {job.salaryRange}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave(job)}
                  disabled={isSaved}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer active:scale-[0.97] ${
                    isSaved
                      ? "bg-accent-muted text-accent"
                      : "border border-border hover:bg-card-hover hover:border-border-light"
                  }`}
                >
                  <BookmarkIcon className="w-3.5 h-3.5" />
                  {isSaved ? "Saved" : "Save"}
                </button>
                <a
                  href={job.applyUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-white transition-all active:scale-[0.97]"
                >
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                  Apply
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
