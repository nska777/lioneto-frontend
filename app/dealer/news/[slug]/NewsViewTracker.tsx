"use client";

import { useEffect, useRef } from "react";

type Props = {
  slug: string;
};

export default function NewsViewTracker({ slug }: Props) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!slug || sentRef.current) return;

    sentRef.current = true;

    void fetch("/api/dealer/news/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ slug }),
    });
  }, [slug]);

  return null;
}
