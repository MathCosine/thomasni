"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm(`Delete “${title}” permanently? This also removes its hearts and comments.`))
      return;
    setPending(true);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setPending(false);
    } catch {
      setPending(false);
    }
  }

  return (
    <button type="button" className="del" onClick={remove} disabled={pending}>
      {pending ? "…" : "Delete"}
    </button>
  );
}
