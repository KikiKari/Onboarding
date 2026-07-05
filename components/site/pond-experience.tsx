"use client";

/**
 * Pond Experience V4 — Neue Story-Logik.
 *
 * PHASEN:
 *   1. idle        → Master-Orb ruht auf linkem Blatt (bg = hero-loop-*)
 *                    KEINE kleinen Kugeln sichtbar.
 *   2. hover-master → Hover-Preview-Card daneben, Master pulsiert leicht.
 *   3. rolling     → Master rollt in den Teich, verkleinert.
 *   4. splashing   → Ganzflächiger Splash (video-B) füllt Viewport.
 *   5. transition  → Hintergrund wechselt zu Phase-4-Pond (rechtes Blatt frei).
 *   6. distributed → 9 kleine Kugeln auf rechtem Blatt.
 *   7. hover-project → Preview-Card daneben.
 *   8. click-splash → Kugel rollt, Vollbild-Splash → GitHub-Weiterleitung.
 *
 * VARIANTE A: hero-loop-B (ruhige Kamera, 2 Blätter) → phase4-pond-A (rechtes Blatt)
 * VARIANTE B: hero-loop-B-v2 (großes Blatt + Kugel) → phase4-pond-A
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { heroPond, projects } from "@/content";

type Project = (typeof projects)[number];

type Phase =
  | "idle"
  | "hover-master"
  | "rolling"
  | "splashing"
  | "transition"
  | "distributed"
  | "hover-project"
  | "click-splash";

interface OrbPosition {
  x: number;
  y: number;
  scale: number;
  z: number;
}

type VariantKey = "A" | "B";

/**
 * Zwei Video-Varianten:
 * A: Video B als Hero (ruhige Kamera, 2 Blätter) - Master auf LINKEM Blatt
 * B: Neues B-Video mit einem großen dominanten Blatt - Master mittig darauf
 * Beide Varianten teilen sich denselben Post-Splash-Hintergrund (phase4-pond-A).
 */
const VARIANTS: Record<
  VariantKey,
  {
    hero: string;
    heroPoster?: string;
    phase4: string;
    splash: string;
    masterPosition: { left: string; top: string; size: string };
    orbLayout: OrbPosition[];
    label: string;
  }
> = {
  A: {
    hero: "/media/hero-v2/videos/hero-loop-B.mp4",
    phase4: "/media/hero-v2/videos/phase4-pond-A.mp4",
    splash: "/media/hero-v2/videos/hero-loop-B.mp4", // Video B enthält Splash-Sequenz
    masterPosition: { left: "34%", top: "65%", size: "clamp(180px, 22vw, 380px)" },
    // 9 Kugeln alle auf dem RECHTEN Blatt (nur rechte Hälfte, gruppiert)
    orbLayout: [
      { x: 62, y: 60, scale: 0.85, z: 3 },
      { x: 68, y: 58, scale: 0.9, z: 4 },
      { x: 74, y: 62, scale: 0.85, z: 3 },
      { x: 60, y: 68, scale: 0.95, z: 5 },
      { x: 66, y: 70, scale: 1.0, z: 6 },
      { x: 72, y: 68, scale: 0.9, z: 4 },
      { x: 78, y: 66, scale: 0.85, z: 3 },
      { x: 64, y: 76, scale: 0.95, z: 5 },
      { x: 72, y: 76, scale: 0.9, z: 4 },
    ],
    label: "A · 2-Blätter",
  },
  B: {
    hero: "/media/hero-v2/videos/hero-loop-B-v2.mp4",
    phase4: "/media/hero-v2/videos/phase4-pond-A.mp4",
    splash: "/media/hero-v2/videos/hero-loop-B.mp4",
    masterPosition: { left: "50%", top: "52%", size: "clamp(140px, 16vw, 280px)" },
    // Nach Splash gleicher Post-BG wie Variante A
    orbLayout: [
      { x: 62, y: 60, scale: 0.85, z: 3 },
      { x: 68, y: 58, scale: 0.9, z: 4 },
      { x: 74, y: 62, scale: 0.85, z: 3 },
      { x: 60, y: 68, scale: 0.95, z: 5 },
      { x: 66, y: 70, scale: 1.0, z: 6 },
      { x: 72, y: 68, scale: 0.9, z: 4 },
      { x: 78, y: 66, scale: 0.85, z: 3 },
      { x: 64, y: 76, scale: 0.95, z: 5 },
      { x: 72, y: 76, scale: 0.9, z: 4 },
    ],
    label: "B · großes Blatt",
  },
};

const ORB_FILES = [
  "orb-01-teal.png",
  "orb-02-copper.png",
  "orb-03-amber.png",
  "orb-04-emerald.png",
  "orb-05-original.png",
  "orb-06-rose.png",
  "orb-07-gold.png",
  "orb-08-lavender.png",
  "orb-09-ivory.png",
];

/** Master-Orb-Bild aus D-Splash (scharfe Glaskugel mit HDRI-Reflex) */
const MASTER_ORB_SRC = "/media/hero-v2/kugeln-v2/master.png";

export function PondExperience() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "distributed" : "idle");
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [variant, setVariant] = useState<VariantKey>("A");
  const [masterHovered, setMasterHovered] = useState(false);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const clickSplashRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const config = VARIANTS[variant];
  const projectsToShow: Project[] = projects.slice(0, 9);

  // Header verstecken bei immersive Hero
  useEffect(() => {
    const updateHeader = () => {
      const threshold = window.innerHeight * 0.9;
      if (window.scrollY < threshold) {
        document.body.setAttribute("data-hero-immersive", "true");
      } else {
        document.body.removeAttribute("data-hero-immersive");
      }
      const vh = window.innerHeight;
      const opacity = Math.max(0, Math.min(1, 1 - window.scrollY / (vh * 0.9)));
      setHeroOpacity(opacity);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateHeader);
      document.body.removeAttribute("data-hero-immersive");
    };
  }, []);

  // Cleanup Timer
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Bei Variant-Wechsel: alles zurücksetzen
  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase(reduceMotion ? "distributed" : "idle");
    setFocusedIdx(null);
    setMasterHovered(false);
  }, [variant, reduceMotion]);

  // Master anklicken → Story-Sequenz
  function onMasterClick() {
    if (reduceMotion) {
      setPhase("distributed");
      return;
    }
    if (phase !== "idle" && phase !== "hover-master") return;

    setPhase("rolling");
    setMasterHovered(false);

    // Nach 1s → Splash-Video starten
    const t1 = setTimeout(() => {
      setPhase("splashing");
      splashVideoRef.current?.play().catch(() => {});
    }, 1000);

    // Nach 2.5s → BG-Wechsel (transition)
    const t2 = setTimeout(() => {
      setPhase("transition");
    }, 2500);

    // Nach 3.5s → 9 Kugeln erscheinen
    const t3 = setTimeout(() => {
      setPhase("distributed");
    }, 3500);

    timersRef.current.push(t1, t2, t3);
  }

  // Projekt-Kugel klicken → Vollbild-Splash → Weiterleitung
  function onProjectClick(project: Project) {
    if (reduceMotion) {
      window.open(project.github, "_blank", "noopener,noreferrer");
      return;
    }
    setPhase("click-splash");
    setTimeout(() => {
      clickSplashRef.current?.play().catch(() => {});
    }, 50);
    const t = setTimeout(() => {
      if (project.github) {
        window.open(project.github, "_blank", "noopener,noreferrer");
      }
      const t2 = setTimeout(() => setPhase("distributed"), 500);
      timersRef.current.push(t2);
    }, 2800);
    timersRef.current.push(t);
  }

  const focused = focusedIdx !== null ? projectsToShow[focusedIdx] : null;

  // Sichtbarkeit der Layer
  const showHeroBG = phase === "idle" || phase === "hover-master" || phase === "rolling";
  const showSplash = phase === "splashing" || phase === "transition";
  const showPhase4BG = phase === "transition" || phase === "distributed" || phase === "hover-project" || phase === "click-splash";
  const showMasterOrb = phase === "idle" || phase === "hover-master" || phase === "rolling";
  const showProjectOrbs = phase === "distributed" || phase === "hover-project";

  return (
    <section
      className="fixed inset-0 z-0 w-screen overflow-hidden bg-black"
      style={{
        height: "100vh",
        opacity: heroOpacity,
        pointerEvents: heroOpacity < 0.1 ? "none" : "auto",
      }}
      aria-label="Interaktiver Teich mit Projektkugeln"
      data-pond-phase={phase}
    >
      {/* Variant-Toggle oben rechts */}
      <div
        className="absolute right-4 top-4 z-[100] flex items-center gap-1 rounded-full border border-white/25 bg-black/50 p-1 backdrop-blur-md"
        role="group"
        aria-label="Video-Variante wählen"
      >
        {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setVariant(key)}
            aria-pressed={variant === key}
            className={`rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors ${
              variant === key ? "bg-white text-black" : "text-white/80 hover:text-white"
            }`}
          >
            {VARIANTS[key].label}
          </button>
        ))}
      </div>

      {/* LAYER 1: Hero-Hintergrund (idle/rolling/hover-master) */}
      <AnimatePresence>
        {showHeroBG && (
          <motion.video
            key={`hero-bg-${variant}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          >
            <source src={config.hero} type="video/mp4" />
          </motion.video>
        )}
      </AnimatePresence>

      {/* LAYER 2: Splash-Video (vollflächig, überdeckt alles beim Rollover) */}
      <AnimatePresence>
        {showSplash && (
          <motion.video
            key={`splash-${variant}`}
            ref={splashVideoRef}
            muted
            playsInline
            autoPlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-30 h-full w-full object-cover"
            aria-hidden="true"
          >
            <source src={config.splash} type="video/mp4" />
          </motion.video>
        )}
      </AnimatePresence>

      {/* LAYER 3: Phase-4-BG (nach Splash, mit rechtem Blatt) */}
      <AnimatePresence>
        {showPhase4BG && (
          <motion.video
            key={`phase4-${variant}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
          >
            <source src={config.phase4} type="video/mp4" />
          </motion.video>
        )}
      </AnimatePresence>

      {/* LAYER 4: Master-Orb */}
      <AnimatePresence>
        {showMasterOrb && (
          <motion.button
            type="button"
            onClick={onMasterClick}
            onMouseEnter={() => phase === "idle" && setMasterHovered(true)}
            onMouseLeave={() => setMasterHovered(false)}
            onFocus={() => phase === "idle" && setMasterHovered(true)}
            onBlur={() => setMasterHovered(false)}
            aria-label={heroPond.masterLink.label}
            className="focus-ring absolute z-20 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={
              phase === "rolling"
                ? { opacity: 0, x: "18vw", y: "10vh", rotate: 720, scale: 0.3 }
                : { opacity: 1, x: 0, y: 0, rotate: 0, scale: masterHovered ? 1.05 : 1 }
            }
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: phase === "rolling" ? 1.0 : 0.5, ease: "easeInOut" }}
            style={{
              left: config.masterPosition.left,
              top: config.masterPosition.top,
              width: config.masterPosition.size,
              height: config.masterPosition.size,
              transform: "translate(-50%, -50%)",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            <img
              src={MASTER_ORB_SRC}
              alt=""
              className="h-full w-full object-contain"
              draggable={false}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* LAYER 5: Master-Hover-Preview-Card (rechts der Master-Orb) */}
      <AnimatePresence>
        {phase === "idle" && masterHovered && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute z-30 w-[280px] rounded-xl bg-white/98 p-5 shadow-2xl"
            style={{
              left: `calc(${config.masterPosition.left} + 12vw)`,
              top: config.masterPosition.top,
              transform: "translate(0, -50%)",
              pointerEvents: "none",
            }}
          >
            <span className="mb-2 inline-block rounded bg-[var(--accent-2,#2E7D7B)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white">
              9 Projekte
            </span>
            <h3 className="mb-1.5 font-[var(--font-display)] text-lg font-medium text-[var(--ink,#1B1A17)]">
              {heroPond.masterLink.label}
            </h3>
            <p className="text-xs leading-snug text-neutral-600">
              {heroPond.masterLink.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 6: 9 Projekt-Kugeln (nur nach Splash sichtbar) */}
      <AnimatePresence>
        {showProjectOrbs &&
          projectsToShow.map((project, idx) => {
            const pos = config.orbLayout[idx];
            const isFocused = focusedIdx === idx;
            const orbFile = ORB_FILES[idx];
            return (
              <motion.button
                key={project.slug}
                type="button"
                onMouseEnter={() => {
                  setFocusedIdx(idx);
                  setPhase("hover-project");
                }}
                onMouseLeave={() => {
                  setFocusedIdx(null);
                  setPhase("distributed");
                }}
                onFocus={() => {
                  setFocusedIdx(idx);
                  setPhase("hover-project");
                }}
                onBlur={() => {
                  setFocusedIdx(null);
                  setPhase("distributed");
                }}
                onClick={() => onProjectClick(project)}
                aria-label={`${project.title} — ${project.platform}`}
                className="focus-ring absolute cursor-pointer"
                initial={{ opacity: 0, left: "50%", top: "75%", scale: 0.1 }}
                animate={{
                  opacity: 1,
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  scale: isFocused ? pos.scale * 1.2 : pos.scale,
                }}
                exit={{ opacity: 0, scale: 0.1 }}
                transition={{
                  duration: phase === "distributed" && !isFocused ? 0.4 : 0.3,
                  delay: 0,
                  ease: "easeOut",
                }}
                style={{
                  width: "clamp(80px, 10vw, 160px)",
                  height: "clamp(80px, 10vw, 160px)",
                  transform: "translate(-50%, -50%)",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  zIndex: 10 + pos.z,
                }}
              >
                <img
                  src={`/media/hero-v2/kugeln-v2/${orbFile}`}
                  alt=""
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* LAYER 7: Projekt-Hover-Preview-Card (rechts der jeweiligen Kugel) */}
      <AnimatePresence>
        {phase === "hover-project" && focused && focusedIdx !== null && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="absolute z-40 w-[260px] rounded-xl bg-white/98 p-5 shadow-2xl"
            style={{
              left: `calc(${config.orbLayout[focusedIdx].x}% - 15vw)`,
              top: `calc(${config.orbLayout[focusedIdx].y}% - 8vh)`,
              transform: "translate(0, 0)",
              pointerEvents: "none",
              maxWidth: "min(260px, 30vw)",
            }}
          >
            <span className="mb-2 inline-block rounded bg-[var(--accent-2,#2E7D7B)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white">
              {focused.platform} · GitHub
            </span>
            <h3 className="mb-1.5 font-[var(--font-display)] text-base font-medium text-[var(--ink,#1B1A17)]">
              {focused.title}
            </h3>
            <p className="text-xs leading-snug text-neutral-600">
              {focused.summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 8: Click-Splash (Vollbild bei Projekt-Klick) */}
      <AnimatePresence>
        {phase === "click-splash" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-50 bg-black"
          >
            <video
              ref={clickSplashRef}
              muted
              playsInline
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            >
              <source src={config.splash} type="video/mp4" />
            </video>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-70">
                  Öffne
                </p>
                <p className="mt-3 font-[var(--font-display)] text-3xl">
                  {focused?.title || "Projekt"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
