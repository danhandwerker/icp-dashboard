"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export default function Nav({ userEmail, onSignOut }: NavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Score" },
    { href: "/dashboard/portfolio", label: "Portfolio" },
    { href: "/dashboard/history", label: "History" },
    { href: "/dashboard/methodology", label: "How it works" },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-white/[0.06] bg-nav/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <RoktLogo />
              <span className="text-white/20 text-sm">|</span>
              <span className="text-sm font-medium text-white/80">
                Ads ICP Dashboard
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === link.href
                      ? "bg-beetroot/15 text-beetroot-light font-medium"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <>
                <span className="text-xs text-gray-500 hidden sm:block">
                  {userEmail}
                </span>
                <button
                  onClick={onSignOut}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function RoktLogo() {
  return (
    <span className="text-lg font-bold tracking-tight flex items-center">
      <span className="text-white">RO</span>
      <span className="text-beetroot">K</span>
      <span className="text-white">T</span>
    </span>
  );
}
