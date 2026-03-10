"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { apiGetMapJobs } from "@/lib/api";
import type { ApiJob } from "@/lib/api";
import type { Job } from "@/lib/types";
import JobDetailModal from "@/components/job-detail-modal";
import {
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

// Dynamically import the map components (no SSR — MapLibre requires DOM)
const MapComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.Map),
  { ssr: false },
);
const MapMarkerComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapMarker),
  { ssr: false },
);
const MarkerContentComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerContent),
  { ssr: false },
);
const MarkerPopupComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerPopup),
  { ssr: false },
);
const MarkerTooltipComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MarkerTooltip),
  { ssr: false },
);
const MapControlsComponent = dynamic(
  () => import("@/components/ui/map").then((m) => m.MapControls),
  { ssr: false },
);

export default function MapPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [mappableJobs, setMappableJobs] = useState<ApiJob[]>([]);
  const [userCoords, setUserCoords] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  useEffect(() => {
    apiGetMapJobs()
      .then((res) => setMappableJobs(res.jobs))
      .catch(() => setMappableJobs([]));
  }, []);

  const handleLocate = useCallback(
    (coords: { longitude: number; latitude: number }) => {
      setUserCoords(coords);
    },
    [],
  );

  // Center on US by default
  const defaultCenter: [number, number] = [-98.5, 39.8];
  const defaultZoom = 3.8;

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh)] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-surface shrink-0">
        <div>
          <h1 className="text-sm font-bold tracking-tight">Job Map</h1>
          <p className="text-[11px] text-muted">
            {mappableJobs.length} in-office &amp; hybrid positions near you
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            Onsite
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            Hybrid
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapComponent
          theme="dark"
          center={defaultCenter}
          zoom={defaultZoom}
          className="w-full h-full"
        >
          <MapControlsComponent
            position="bottom-right"
            showZoom
            showLocate
            onLocate={handleLocate}
          />

          {mappableJobs.map((job) => (
            <MapMarkerComponent
              key={job.id}
              longitude={job.coordinates?.lng ?? 0}
              latitude={job.coordinates?.lat ?? 0}
            >
              <MarkerContentComponent>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-transform hover:scale-110 ${
                    job.workArrangement === "onsite"
                      ? "bg-accent border-accent/50"
                      : "bg-yellow-500 border-yellow-400/50"
                  }`}
                >
                  <BuildingOfficeIcon className="w-4 h-4 text-white" />
                </div>
              </MarkerContentComponent>

              <MarkerTooltipComponent>
                <div className="min-w-[140px]">
                  <p className="font-semibold text-xs">{job.title}</p>
                  <p className="text-[11px] text-muted">{job.company}</p>
                </div>
              </MarkerTooltipComponent>

              <MarkerPopupComponent closeButton>
                <div className="min-w-[220px] max-w-[260px]">
                  <h3 className="font-semibold text-sm mb-0.5">{job.title}</h3>
                  <p className="text-xs text-muted mb-2">{job.company}</p>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                      {job.location}
                    </div>
                    {job.salaryRange && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <CurrencyDollarIcon className="w-3.5 h-3.5 shrink-0" />
                        {job.salaryRange}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-[10px] bg-surface-raised border border-border rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-accent-muted text-accent text-[11px] font-bold tabular-nums">
                      {job.matchScore}% match
                    </span>
                    <button
                      onClick={() => setSelectedJob(job as unknown as Job)}
                      className="text-xs text-accent hover:text-accent-hover font-semibold cursor-pointer transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </MarkerPopupComponent>
            </MapMarkerComponent>
          ))}
        </MapComponent>
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
