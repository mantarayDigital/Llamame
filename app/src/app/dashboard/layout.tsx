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
  Settings,
  type LucideIcon,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { SIDEBAR_W } from "@/lib/theme";
import { dashboardNav } from "@/lib/navigation";
import { demoUser } from "@/lib/demo-data";
// Layout stays a server component — uses static demo data for sidebar.
// When auth is added, user info will come from session/cookie, not hooks.

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
  Settings,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-bg-raised border-r border-border hidden lg:flex flex-col px-4 py-6 z-50">
        <Link
          href="/"
          className="text-xl font-bold px-3 mb-8"
        >
          {appConfig.logoPrefix}
          <span className="text-accent">{appConfig.logoAccent}</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {dashboardNav.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && (
                <div className="h-px bg-border my-3" />
              )}
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
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
