"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Calendar,
  CalendarDays,
  Users,
  MessageCircle,
  DollarSign,
  BarChart3,
  Zap,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { dashboardNav } from "@/lib/navigation";
import { demoUser } from "@/lib/demo-data";

/** Map icon name strings from dashboardNav to actual Lucide components */
const iconMap: Record<string, LucideIcon> = {
  Home,
  Calendar,
  CalendarDays,
  Users,
  MessageCircle,
  DollarSign,
  BarChart3,
  Zap,
  CreditCard,
  FileText,
  Settings,
};

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button -- visible only on mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-bg-raised border border-border text-text-sec hover:text-text transition"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-bg-raised border-r border-border flex flex-col px-4 py-6 transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header: logo + close button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="text-xl font-bold px-3"
            onClick={() => setOpen(false)}
          >
            {appConfig.logoPrefix}
            <span className="text-accent">{appConfig.logoAccent}</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-text-sec hover:text-text transition"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1">
          {dashboardNav.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="h-px bg-border my-3" />}
              {group.items.map((item) => {
                const Icon = iconMap[item.icon];
                if (item.comingSoon) {
                  return (
                    <span
                      key={item.label}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium opacity-40 cursor-default text-text-sec"
                    >
                      {Icon && <Icon className="w-[18px] h-[18px]" />}
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-[0.65rem] px-1.5 py-0.5 rounded-full bg-accent-muted text-accent font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      item.href === "/dashboard"
                        ? "bg-accent-muted text-text border border-accent/20"
                        : "text-text-sec hover:bg-white/[0.03] hover:text-text"
                    }`}
                  >
                    {Icon && <Icon className="w-[18px] h-[18px]" />}
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto text-[0.65rem] px-1.5 py-0.5 rounded-full bg-accent-muted text-accent font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User avatar section at bottom */}
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white/[0.03]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center font-bold text-xs shrink-0">
            {demoUser.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-semibold truncate">
              {demoUser.name}
            </strong>
            <span className="text-xs text-text-muted capitalize">
              {demoUser.plan} Plan
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
