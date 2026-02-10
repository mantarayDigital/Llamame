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
  type LucideIcon,
} from "lucide-react";
import { appConfig } from "@/lib/config";
import { SIDEBAR_W } from "@/lib/theme";
import { dashboardNav } from "@/lib/navigation";
import SidebarUser from "@/components/SidebarUser";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <MobileNav />
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

          <SidebarUser />
        </aside>

        {/* Main content */}
        <main className="lg:ml-[260px] flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
