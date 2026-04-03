"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardCheck, Trophy, Award, User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard",               icon: LayoutDashboard, label: "Dashboard"   },
  { href: "/dashboard/study",         icon: BookOpen,        label: "Study"       },
  { href: "/dashboard/practice-test", icon: ClipboardCheck,  label: "Tests"       },
  { href: "/dashboard/leaderboard",   icon: Trophy,          label: "Leaderboard" },
  { href: "/dashboard/badges",        icon: Award,           label: "Badges"      },
  { href: "/dashboard/profile",       icon: User,            label: "Profile"     },
  { href: "/dashboard/settings",      icon: Settings,        label: "Settings"    },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 z-40">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shadow">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold gradient-text">PinPoint</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive(href)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} className={isActive(href) ? "text-blue-600" : "text-gray-400"} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-stretch">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive(href) ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <Icon size={20} strokeWidth={isActive(href) ? 2.5 : 1.5} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
