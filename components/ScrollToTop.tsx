"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function jumpTop() {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export default function ScrollToTop() {
  const path = usePathname();
  useEffect(() => {
    jumpTop();
    const a = requestAnimationFrame(jumpTop);
    const t = window.setTimeout(jumpTop, 80);
    const t2 = window.setTimeout(jumpTop, 250);
    return () => {
      cancelAnimationFrame(a);
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [path]);
  return null;
}
