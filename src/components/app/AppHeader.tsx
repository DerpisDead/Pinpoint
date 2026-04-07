"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import type { Profile } from "@/types/database";

type Props = {
  profile: Profile | null;
};

export default function AppHeader({ profile }: Props) {
  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-[#F8FAFC]/95 backdrop-blur-sm border-b border-gray-100 z-30 flex items-center gap-3">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search cards, events…"
            className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C3F6E]/20 focus:border-[#1C3F6E]/40 transition-colors"
          />
        </div>
      </div>

      {/* User */}
      <Link href="/dashboard/profile" aria-label="Go to profile" className="flex items-center gap-2.5 group">
        {/* XP badge */}
        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5EEF0] text-[#8B1A2D] border border-[#E9C8CE]">
          ⚡ {profile?.total_xp ?? 0} XP
        </span>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden gradient-btn flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:opacity-90 transition-opacity">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={initials} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </Link>
    </header>
  );
}
