"use client";

import { useCurrentUser } from "@/lib/data";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SidebarUser() {
  const user = useCurrentUser();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white/[0.03]">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-violet flex items-center justify-center font-bold text-xs shrink-0">
        {user?.name?.charAt(0) ?? ""}
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block text-sm font-semibold truncate">
          {user?.name ?? ""}
        </strong>
        <span className="text-xs text-text-muted capitalize">
          {user?.plan ?? "free"} Plan
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-white/[0.05] transition"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
