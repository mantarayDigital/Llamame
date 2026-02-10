"use client";

import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const pathname = usePathname();
  const getOrCreate = useMutation(api.users.getOrCreateFromAuth);
  const ensuredRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  useEffect(() => {
    if (isAuthenticated && !ensuredRef.current) {
      ensuredRef.current = true;
      getOrCreate().catch(() => {
        // User doc creation failed — will retry on next render
        ensuredRef.current = false;
      });
    }
  }, [isAuthenticated, getOrCreate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
