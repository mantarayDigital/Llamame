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
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  {
    icon: Calendar,
    label: "Event Types",
    href: "/dashboard/events",
  },
  { icon: CalendarDays, label: "Calendar", href: "#" },
  { icon: Users, label: "Clients", href: "#" },
  { icon: MessageCircle, label: "Messages", href: "#" },
  { type: "divider" as const },
  { icon: DollarSign, label: "Payments", href: "#" },
  { icon: BarChart3, label: "Analytics", href: "#" },
  { icon: Zap, label: "Workflows", href: "#" },
  { type: "divider" as const },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-bg-raised border-r border-border flex flex-col px-4 py-6 z-50">
        <Link
          href="/"
          className="text-xl font-bold px-3 mb-8"
        >
          Llama<span className="text-accent">me</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item, i) => {
            if ("type" in item && item.type === "divider") {
              return (
                <div key={`div-${i}`} className="h-px bg-border my-3" />
              );
            }
            const Icon = item.icon!;
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  item.active
                    ? "bg-accent-muted text-text border border-accent/20"
                    : "text-text-sec hover:bg-white/[0.03] hover:text-text"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white/[0.03]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center font-bold text-xs shrink-0">
            M
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm font-semibold truncate">
              MantaRay Digital
            </strong>
            <span className="text-xs text-text-muted">Pro Plan</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[260px] flex-1 p-8">{children}</main>
    </div>
  );
}
