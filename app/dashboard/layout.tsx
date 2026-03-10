"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import {
  HomeIcon,
  SparklesIcon,
  RectangleStackIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  BuildingOffice2Icon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  SparklesIcon as SparklesIconSolid,
  RectangleStackIcon as RectangleStackIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  BuildingOffice2Icon as BuildingOffice2IconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  MapIcon as MapIconSolid,
} from "@heroicons/react/24/solid";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    href: "/dashboard/matches",
    label: "Matches",
    icon: SparklesIcon,
    activeIcon: SparklesIconSolid,
  },
  {
    href: "/dashboard/feed",
    label: "Job Feed",
    icon: MagnifyingGlassIcon,
    activeIcon: MagnifyingGlassIconSolid,
  },
  {
    href: "/dashboard/map",
    label: "Job Map",
    icon: MapIcon,
    activeIcon: MapIconSolid,
  },
  {
    href: "/dashboard/tracker",
    label: "Tracker",
    icon: RectangleStackIcon,
    activeIcon: RectangleStackIconSolid,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: UserCircleIcon,
    activeIcon: UserCircleIconSolid,
  },
];

const employerNavItems = [
  {
    href: "/dashboard/company",
    label: "Company",
    icon: BuildingOffice2Icon,
    activeIcon: BuildingOffice2IconSolid,
  },
  {
    href: "/dashboard/post-job",
    label: "Post a Job",
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIconSolid,
  },
  {
    href: "/dashboard/listings",
    label: "Listings",
    icon: ClipboardDocumentListIcon,
    activeIcon: ClipboardDocumentListIconSolid,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, rehydrateAuth } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    rehydrateAuth();
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/");
    }
  }, [mounted, isAuthenticated, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-40 md:hidden">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Vocation" width={22} height={22} />
          <span className="font-bold tracking-tight text-sm text-lime">
            Vocation
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-card transition-all cursor-pointer"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-5 h-5" />
          ) : (
            <Bars3Icon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-[240px] border-r border-border flex flex-col fixed top-0 left-0 bottom-0 bg-surface z-50 transition-transform duration-200 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:z-30`}
      >
        <div className="px-5 h-14 flex items-center gap-2.5 border-b border-border">
          <Image src="/logo.svg" alt="Vocation" width={24} height={24} />
          <span className="font-bold tracking-tight text-sm">Vocation</span>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <span className="block px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Job Seeker
          </span>
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-accent-muted text-accent"
                    : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 pb-1">
            <span className="block px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Employer
            </span>
          </div>
          {employerNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = isActive ? item.activeIcon : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-accent-muted text-accent"
                    : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center">
              <span className="text-xs font-bold text-accent">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-muted hover:text-foreground hover:bg-card transition-all cursor-pointer"
          >
            <ArrowRightStartOnRectangleIcon className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-[240px] min-h-screen pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
