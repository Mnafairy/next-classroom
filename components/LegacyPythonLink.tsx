"use client";

import { useEffect } from "react";

/** Keep existing classroom bookmarks from before Python moved to /python. */
export default function LegacyPythonLink() {
  useEffect(() => {
    const forward = () => {
      if (
        /^#\/(exercises|tests|play|visualize)(\/|$)/.test(window.location.hash)
      ) {
        window.location.replace(`/python${window.location.hash}`);
      }
    };
    forward();
    window.addEventListener("hashchange", forward);
    return () => window.removeEventListener("hashchange", forward);
  }, []);
  return null;
}
