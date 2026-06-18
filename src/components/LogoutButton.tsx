"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" className="btn secondary" onClick={logout} disabled={pending}>
      {pending ? "…" : "Sign out"}
    </button>
  );
}
