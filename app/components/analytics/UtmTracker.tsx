"use client";

import { useEffect } from "react";
import { saveUtmIfExists } from "@/app/lib/utm";

export default function UtmTracker() {
  useEffect(() => {
    saveUtmIfExists();
  }, []);

  return null;
}
