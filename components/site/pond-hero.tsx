"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { heroPond, siteContent } from "@/content";

// R3F is client-only and heavy — load it lazily with a graceful fallback.
const PondCanvas = dynamic(
  () => import("./pond/pond-canvas").then((m) => m.PondCanvas),
  { ssr: false, loading: () => <PondCover /> },
);

function PondCover() {
  return (
    <div className="absolute inset-0">
      <Image
        src="/media/pond/concepts/variante-C.webp"
        alt="Ruhiger Teich mit Seerosen und Glaskugeln"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}

function hasWebGL() {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function PondHero() {
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
    setMounted(true);
  }, []);

  // Avoid hydration mismatch: reduced-motion state is only known client-side.
  const reducedMotion = mounted ? !!reduce : false;

  return (
    <div className="flex flex-col items-center gap-7">
      <div className="relative aspect-[16/10] w-full max-w-[56rem] overflow-hidden rounded-[var(--radius-lg)] border border-line bg-[linear-gradient(180deg,#f4f1ea,#e9ebe1)] shadow-[var(--shadow-lg)]">
        {webgl ? <PondCanvas reduce={reducedMotion} /> : <PondCover />}
        <noscript>
          {/* Static fallback when JS/WebGL is unavailable. */}
          <img
            src="/media/pond/concepts/variante-C.webp"
            alt="Ruhiger Teich mit Seerosen und Glaskugeln"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        </noscript>
      </div>

      <p className="m-0 max-w-[52ch] text-center font-mono text-xs text-muted">
        {reducedMotion
          ? "Neun Projektkugeln ruhen auf ihren Seerosenblättern — Hover zum Öffnen."
          : "Zeigen Sie auf die leuchtende Kugel am Ufer — sie taucht ins Wasser und lässt neun Projekte auftauchen."}
      </p>

      {/* Subtle secondary CTAs — the pond carries the primary interaction. */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button href={heroPond.masterLink.href} variant="secondary" size="sm">
          {siteContent.hero.primary.label} →
        </Button>
        <Button href={siteContent.hero.secondary.href} variant="ghost" size="sm">
          {siteContent.hero.secondary.label}
        </Button>
      </div>
    </div>
  );
}
