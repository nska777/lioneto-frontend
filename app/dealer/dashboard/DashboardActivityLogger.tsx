"use client";

import { useEffect, useRef } from "react";

export default function DashboardActivityLogger() {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;

    void fetch("/api/dealer/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        actionType: "view_dashboard",
        entityType: "page",
        entityId: "/dealer/dashboard",
        entityTitle: "Dealer Dashboard",
        url: window.location.pathname,
        payload: {
          source: "dealer-dashboard",
        },
      }),
    });
  }, []);

  return null;
}
