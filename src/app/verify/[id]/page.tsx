"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function VerifyAgent() {
  const params = useParams();
  const id = params.id as string;

  // For now, redirect to verify page with query
  // Later this becomes a direct on-chain lookup
  useEffect(() => {
    window.location.href = `/verify?q=${id}`;
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <span className="text-terminal-dim">[scan]</span> Looking up Agent #{id}<span className="cursor-blink" />
      </div>
    </div>
  );
}
