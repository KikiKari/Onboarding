"use client";

import { Canvas } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { heroPond, projects } from "@/content";
import { PondScene } from "./scene";
import type { Phase } from "./types";

const PLATFORM_TINT: Record<string, string> = {
  Claude: "var(--accent)",
  Perplexity: "var(--accent-2)",
};

export function PondCanvas({ reduce }: { reduce: boolean }) {
  const [phase, setPhase] = useState<Phase>(reduce ? "distributed" : "idle");
  const [focusedProject, setFocusedProject] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  // Capability gate: high-quality transmission + post-FX only when the device
  // pixel ratio is modest (<= 1.5) and the user hasn't asked to reduce motion.
  // Low-end / high-DPR / reduced-motion falls back to the lighter path.
  const [highQuality, setHighQuality] = useState(false);
  useEffect(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 2;
    setHighQuality(dpr <= 1.5 && !reduce);
  }, [reduce]);
  const postFx = highQuality;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  // Master-orb hover kicks off the roll → splash → emerge → distributed chain.
  const startSequence = useCallback(() => {
    if (reduce || phase !== "idle") return;
    setPhase("rolling");
    timers.current.push(
      window.setTimeout(() => setPhase("splashing"), 1200),
      window.setTimeout(() => setPhase("emerging"), 1200 + 800),
      window.setTimeout(() => setPhase("distributed"), 1200 + 800 + 1500),
    );
  }, [phase, reduce]);

  const onMasterClick = useCallback(() => {
    window.open(heroPond.masterLink.href, "_blank", "noopener,noreferrer");
  }, []);

  const onProjectClick = useCallback((slug: string) => {
    const project = projects.find((p) => p.slug === slug);
    if (project) window.open(project.github, "_blank", "noopener,noreferrer");
  }, []);

  const setFocus = useCallback(
    (id: string | null) => {
      setFocusedProject(id);
      setPhase((prev) => {
        if (id && (prev === "distributed" || prev === "focused")) return "focused";
        if (!id && prev === "focused") return "distributed";
        return prev;
      });
    },
    [],
  );

  const focused = useMemo(
    () => projects.find((p) => p.slug === focusedProject) ?? null,
    [focusedProject],
  );

  // Keyboard access: Tab-focusable buttons that map to each orb.
  const activateOrb = (slug: string) => onProjectClick(slug);

  return (
    <div
      role="application"
      aria-label="Interaktiver Teich mit Projektkugeln"
      className="relative h-full w-full"
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 3.4, 6.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <PondScene
          phase={phase}
          focusedProject={focusedProject}
          setFocusedProject={setFocus}
          onMasterHover={startSequence}
          onMasterClick={onMasterClick}
          onProjectClick={onProjectClick}
          onSplashDone={() => {}}
          reduce={reduce}
          highQuality={highQuality}
        />
        {postFx && (
          <EffectComposer>
            {/* Keep the interactive pond sharp; only the far blossom layer melts
                into bokeh. A tight focalLength at this camera distance would
                blur the whole scene, so we focus near the pond and let the
                background fall off. */}
            <DepthOfField focusDistance={0.012} focalLength={0.2} bokehScale={3} />
            <Bloom intensity={0.18} luminanceThreshold={0.92} luminanceSmoothing={0.6} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>

      {/* Idle hint — zentraler Startpunkt der Story-Sequenz.
          Wird immer im Viewport-Zentrum unten platziert, ist damit responsiv
          erreichbar und der primäre Trigger für die gesamte Interaktion. */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.button
            type="button"
            onClick={onMasterClick}
            onMouseEnter={startSequence}
            onFocus={startSequence}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="focus-ring absolute left-1/2 bottom-6 -translate-x-1/2 rounded-[var(--radius-pill)] border border-line bg-surface/90 px-5 py-2 font-mono text-xs text-ink shadow-[var(--shadow-md)] backdrop-blur hover:bg-surface hover:shadow-[var(--shadow-lg)] transition-all"
            aria-label={`${heroPond.masterLink.label} — startet Teich-Sequenz`}
          >
            {heroPond.masterLink.label} →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Debug phase indicator (nur in development sichtbar). */}
      {process.env.NODE_ENV === "development" && (
        <div
          data-pond-phase={phase}
          className="pointer-events-none absolute right-3 top-3 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white"
        >
          {phase}
          {focusedProject ? ` · ${focusedProject}` : ""}
        </div>
      )}

      {/* Focused project card. */}
      <AnimatePresence>
        {focused && (phase === "focused" || phase === "distributed") && (
          <motion.div
            key={focused.slug}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-[8%] w-[min(22rem,80%)] -translate-x-1/2 rounded-[var(--radius-lg)] border border-line bg-surface/95 p-5 shadow-[var(--shadow-lg)] backdrop-blur"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="display m-0 text-xl">{focused.title}</h3>
              <span
                className="eyebrow rounded-[var(--radius-pill)] px-2 py-0.5 text-[0.625rem] text-white"
                style={{ background: PLATFORM_TINT[focused.platform] }}
              >
                {focused.platform}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{focused.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {focused.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[var(--radius-pill)] border border-line bg-surface-2 px-2 py-0.5 font-mono text-[0.625rem] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessible keyboard controls: hidden-until-focus buttons per orb. */}
      <div className="sr-only-focusable absolute bottom-2 left-2 flex flex-wrap gap-1">
        <button
          type="button"
          onFocus={startSequence}
          onClick={onMasterClick}
          className="focus-ring rounded bg-surface px-2 py-1 text-xs opacity-0 focus:opacity-100"
        >
          {heroPond.masterLink.label}
        </button>
        {projects.map((p) => (
          <button
            key={p.slug}
            type="button"
            onFocus={() => setFocus(p.slug)}
            onBlur={() => setFocus(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") activateOrb(p.slug);
            }}
            onClick={() => activateOrb(p.slug)}
            className="focus-ring rounded bg-surface px-2 py-1 text-xs opacity-0 focus:opacity-100"
            aria-label={`${p.title} auf GitHub öffnen`}
          >
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
