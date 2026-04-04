"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/community",        label: "Browse"   },
  { href: "/dashboard/community/upload", label: "Upload"   },
];

export default function CommunityTabs() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-gray-100 mb-6">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
