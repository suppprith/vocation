"use client";

import { useState, useEffect } from "react";
import { apiGetMatchedJobs, apiCreateApplication } from "@/lib/api";
import type { ApiJob } from "@/lib/api";
import {
  SparklesIcon,
  BookmarkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import type { Job } from "@/lib/types";
import JobDetailModal from "@/components/job-detail-modal";

export default function MatchesPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiGetMatchedJobs()
      .then((res) => setJobs(res.jobs))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (job: ApiJob) => {
    if (savedIds.has(job.id)) return;
    try {
      await apiCreateApplication({ jobId: job.id, status: "saved" });
      setSavedIds((prev) => new Set(prev).add(job.id));
    } catch {}
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-5">
        <h1 className="text-lg font-bold tracking-tight">Matches</h1>
        <p className="text-xs text-muted mt-0.5">
          {jobs.length} jobs ranked by fit
        </p>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-16 text-muted">
            <p className="text-xs">Loading matches...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <SparklesIcon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-[13px] mb-1">No matches yet</p>
            <p className="text-xs text-muted-foreground">
              Complete your profile to get matched.
            </p>
          </div>
        ) : (
          jobs.map((job) => {
            const isSaved = savedIds.has(job.id);
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job as unknown as Job)}
                className="p-4 rounded-xl border border-border bg-card hover:bg-card-hover hover:border-border-light transition-all cursor-pointer"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(job);
                    }}
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
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent hover:bg-accent-hover text-white transition-all active:scale-[0.97]"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    Apply
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
