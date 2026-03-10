"use client";

import { useState, useEffect, type DragEvent } from "react";
import {
  apiGetTracker,
  apiUpdateApplicationStatus,
  apiDeleteApplication,
} from "@/lib/api";
import type { ApiApplication } from "@/lib/api";
import type { ApplicationStatus } from "@/lib/types";
import {
  BookmarkIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const COLUMNS: {
  status: ApplicationStatus;
  label: string;
  icon: typeof BookmarkIcon;
  color: string;
  dotColor: string;
}[] = [
  {
    status: "saved",
    label: "Saved",
    icon: BookmarkIcon,
    color: "text-muted",
    dotColor: "bg-muted",
  },
  {
    status: "applied",
    label: "Applied",
    icon: PaperAirplaneIcon,
    color: "text-accent",
    dotColor: "bg-accent",
  },
  {
    status: "interviewing",
    label: "Interviewing",
    icon: ChatBubbleLeftRightIcon,
    color: "text-warning",
    dotColor: "bg-warning",
  },
  {
    status: "offer",
    label: "Offer",
    icon: TrophyIcon,
    color: "text-success",
    dotColor: "bg-success",
  },
  {
    status: "rejected",
    label: "Rejected",
    icon: XCircleIcon,
    color: "text-danger",
    dotColor: "bg-danger",
  },
];

export default function TrackerPage() {
  const [tracker, setTracker] = useState<
    Record<ApplicationStatus, ApiApplication[]>
  >({
    saved: [],
    applied: [],
    interviewing: [],
    offer: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] =
    useState<ApplicationStatus | null>(null);

  const loadTracker = async () => {
    try {
      const res = await apiGetTracker();
      setTracker(res.tracker as Record<ApplicationStatus, ApiApplication[]>);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadTracker();
  }, []);

  const getAppsForColumn = (status: ApplicationStatus) => tracker[status] || [];

  const handleDragStart = (e: DragEvent, appId: string) => {
    setDraggedId(appId);
    e.dataTransfer.effectAllowed = "move";
    // Use a timeout so the element doesn't disappear immediately
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => target.classList.add("opacity-40"), 0);
  };

  const handleDragEnd = (e: DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("opacity-40");
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    if (draggedId) {
      try {
        await apiUpdateApplicationStatus(draggedId, status);
        await loadTracker();
      } catch {}
    }
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const startEditNotes = (app: ApiApplication) => {
    setEditingNotesId(app.id);
    setNoteText(app.notes || "");
  };

  const saveNotes = async () => {
    if (editingNotesId) {
      try {
        await apiUpdateApplicationStatus(editingNotesId, "", noteText);
      } catch {
        // If status update fails (no status change), just reload
      }
      await loadTracker();
      setEditingNotesId(null);
      setNoteText("");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiDeleteApplication(id);
      await loadTracker();
    } catch {}
  };

  const allApps = Object.values(tracker).flat();
  const totalApps = allApps.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-3.5rem)] md:h-[calc(100vh)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Job Tracker</h1>
          <p className="text-xs text-muted mt-0.5">
            {totalApps} {totalApps === 1 ? "job" : "jobs"} tracked
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted">Loading tracker...</p>
        </div>
      ) : totalApps === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mx-auto mb-3">
              <BookmarkIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm mb-1">No jobs tracked yet</p>
            <p className="text-xs text-muted-foreground max-w-60">
              Save jobs from the feed or matches pages, or click &quot;Add
              Job&quot; above to start tracking.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 flex-1 overflow-x-auto pb-2 min-h-0">
          {COLUMNS.map((column) => {
            const apps = getAppsForColumn(column.status);
            const isOver = dragOverColumn === column.status;

            return (
              <div
                key={column.status}
                className="shrink-0 w-[260px] sm:w-65 flex flex-col min-h-0"
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 px-2 py-2 mb-2 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                  <span className="text-xs font-semibold">{column.label}</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {apps.length}
                  </span>
                </div>

                {/* Drop zone */}
                <div
                  className={`flex-1 rounded-xl p-1.5 space-y-1.5 overflow-y-auto transition-colors ${
                    isOver
                      ? "bg-accent-muted/30 ring-1 ring-accent/20"
                      : "bg-surface/50"
                  }`}
                >
                  {apps.length === 0 && !isOver && (
                    <div className="text-center py-10 text-[11px] text-muted-foreground/60">
                      Drag here
                    </div>
                  )}

                  {apps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 rounded-xl bg-card border border-border hover:border-border-light transition-all cursor-grab active:cursor-grabbing ${
                        draggedId === app.id ? "opacity-40" : ""
                      }`}
                    >
                      {/* Title & company */}
                      <div className="mb-1.5">
                        <h4 className="text-[13px] font-semibold leading-tight truncate">
                          {app.job.title}
                        </h4>
                        <p className="text-[11px] text-muted mt-0.5">
                          {app.job.company}
                        </p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                        <span className="inline-flex items-center gap-0.5">
                          <MapPinIcon className="w-3 h-3" />
                          {app.job.location}
                        </span>
                        {app.job.salaryRange && (
                          <span>{app.job.salaryRange}</span>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded-md bg-surface-raised text-[10px] text-muted capitalize">
                          {app.job.workArrangement}
                        </span>
                      </div>

                      {/* Notes */}
                      {editingNotesId === app.id ? (
                        <div className="mt-1.5">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1.5 bg-input border border-border rounded-lg text-[11px] focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent resize-none transition-all"
                            placeholder="Notes..."
                            autoFocus
                          />
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={saveNotes}
                              className="p-1 rounded-md text-accent hover:bg-accent-muted transition-all cursor-pointer"
                            >
                              <CheckIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="p-1 rounded-md text-muted hover:text-foreground transition-all cursor-pointer"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : app.notes ? (
                        <div
                          className="mt-1 p-1.5 rounded-lg bg-surface-raised text-[10px] text-muted leading-relaxed cursor-pointer hover:text-foreground transition-colors"
                          onClick={() => startEditNotes(app)}
                        >
                          {app.notes}
                        </div>
                      ) : null}

                      {/* Actions */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/60">
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(app.appliedAt)}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => startEditNotes(app)}
                            className="p-1 rounded-md text-muted-foreground hover:text-accent hover:bg-accent-muted transition-all cursor-pointer"
                            title="Add note"
                          >
                            <PencilSquareIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleRemove(app.id)}
                            className="p-1 rounded-md text-muted-foreground hover:text-danger transition-all cursor-pointer"
                            title="Remove"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
