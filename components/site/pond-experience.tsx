"use client";

/**
 * Pond Experience V8 — wide-idle-v2 Video mit 9 Projekt-Kugeln auf 4 Blättern.
 *
 * BÜHNE:
 *   Layer 1: wide-idle-v2.mp4 (12s Sonnenuntergang-Teich, Loop)
 *            Master-Kugel bereits echt im Video bei 44%/79%
 *   Layer 2: Master-Klickbox transparent über der Video-Kugel
 *   Layer 3: 9 Projekt-Kugeln nach Klick, verteilt auf 4 Blätter:
 *              - Vorne links: 3 Kugeln (10%/62%, 22%/64%, 30%/60%)
 *              - Vorne rechts: 2 Kugeln (72%/70%, 82%/72%)
 *              - Hinten links: 2 Kugeln (44%/54%, 55%/56%)
 *              - Hinten rechts: 2 Kugeln (66%/52%, 76%/53%)
 *   Layer 4: Hover-Cards
 *   Layer 5: Click-Splash beim Projekt-Klick (rolling-splash-v3)
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { heroPond, projects } from "@/content";

type Project = (typeof projects)[number];

type Phase = "idle" | "hover-master" | "distributed" | "hover-project" | "click-splash";

/** Master-Kugel im wide-idle-v2 Video, gemessen bei 44%/79%, Durchmesser 28vh */
const MASTER = {
  left: "44%",
  top: "79%",
  size: "clamp(180px, 28vh, 340px)",
};

/**
 * 9 Projekt-Kugeln verteilt auf 4 Lotus-Blätter im wide-idle-v2 Video.
 * Positionen exakt nach User-Vorgabe (violette Markierungen im Preview).
 * Hinten kleiner (Perspektive), vorne grösser.
 */
const ORB_LAYOUT = [
  // Vorne links (3 Kugeln auf grossem linkem Blatt)
  { x: 12, y: 63, scale: 0.70 },
  { x: 24, y: 65, scale: 0.75 },
  { x: 32, y: 62, scale: 0.70 },
  // Vorne rechts (2 Kugeln auf grossem rechtem Blatt)
  { x: 74, y: 72, scale: 0.75 },
  { x: 84, y: 72, scale: 0.70 },
  // Hinten links (2 Kugeln auf mittlerem Blatt mit pinker Bluete)
  { x: 34, y: 48, scale: 0.55 },
  { x: 42, y: 47, scale: 0.55 },
  // Hinten rechts (2 Kugeln auf hinterem rechtem Blatt)
  { x: 58, y: 40, scale: 0.48 },
  { x: 64, y: 40, scale: 0.48 },
] as const;

const ORB_FILES = [
  "glass-orbs-v2/orb-01-teal.png",
  "glass-orbs-v2/orb-02-copper.png",
  "glass-orbs-v2/orb-03-amber.png",
  "glass-orbs-v2/orb-04-emerald.png",
  "glass-orbs-v2/orb-05-clear.png",
  "glass-orbs-v2/orb-06-rose.png",
  "glass-orbs-v2/orb-07-gold.png",
  "glass-orbs-v2/orb-08-lavender.png",
  "glass-orbs-v2/orb-09-ivory.png",
];

const IDLE_VIDEO = "/media/hero-v2/videos/wide-idle-v2.mp4";
const SPLASH_VIDEO = "/media/hero-v2/videos/rolling-splash-v3.mp4";

export function PondExperience() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "distributed" : "idle");
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [masterHovered, setMasterHovered] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [clickSplash, setClickSplash] = useState<{ active: boolean; project: Project | null }>({
    active: false,
    project: null,
  });

  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const clickSplashRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const projectsToShow: Project[] = projects.slice(0, 9);

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

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  function onMasterClick() {
    if (reduceMotion) {
      setPhase("distributed");
      return;
    }
    if (phase !== "idle" && phase !== "hover-master") return;
    setMasterHovered(false);
    setPhase("distributed");
  }

  function onProjectClick(project: Project) {
    if (reduceMotion) {
      window.open(project.github, "_blank", "noopener,noreferrer");
      return;
    }
    setClickSplash({ active: true, project });
    setTimeout(() => clickSplashRef.current?.play().catch(() => {}), 50);
    const t = setTimeout(() => {
      if (project.github) {
        window.open(project.github, "_blank", "noopener,noreferrer");
      }
      const t2 = setTimeout(() => setClickSplash({ active: false, project: null }), 500);
      timersRef.current.push(t2);
    }, 2500);
    timersRef.current.push(t);
  }

  const focused = focusedIdx !== null ? projectsToShow[focusedIdx] : null;
  const showMaster = phase === "idle" || phase === "hover-master";
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
      <div
        className="pond-stage absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, calc(100vh * 16 / 9))",
          height: "max(100vh, calc(100vw * 9 / 16))",
        }}
      >
        {/* LAYER 1 — Idle-Video (12s Loop, Master-Kugel echt im Video) */}
        <video
          ref={idleVideoRef}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        >
          <source src={IDLE_VIDEO} type="video/mp4" />
        </video>

        {/* LAYER 2 — Master-Klickbox (transparent, exakt über Video-Kugel) */}
        <AnimatePresence>
          {showMaster && (
            <motion.button
              type="button"
              onClick={onMasterClick}
              onMouseEnter={() => setMasterHovered(true)}
              onMouseLeave={() => setMasterHovered(false)}
              onFocus={() => setMasterHovered(true)}
              onBlur={() => setMasterHovered(false)}
              aria-label={heroPond.masterLink.label}
              className="focus-ring absolute z-20 cursor-pointer rounded-full"
              initial={{ opacity: 0, x: "-50%", y: "-50%" }}
              animate={{
                opacity: 1,
                x: "-50%",
                y: "-50%",
                scale: masterHovered ? 1.15 : 1,
              }}
              exit={{ opacity: 0, x: "-50%", y: "-50%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: MASTER.left,
                top: MASTER.top,
                width: MASTER.size,
                height: MASTER.size,
                background: "transparent",
                border: "none",
                padding: 0,
                transformOrigin: "center center",
              }}
            >
              <span className="sr-only">{heroPond.masterLink.label}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* LAYER 3 — Master-Hover-Card */}
        <AnimatePresence>
          {phase === "idle" && masterHovered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute z-30 w-[300px] rounded-xl bg-white/98 p-5 shadow-2xl"
              style={{
                left: "50%",
                top: "8%",
                transform: "translate(-50%, 0)",
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

        {/* LAYER 4 — 9 Projekt-Kugeln auf den 4 Blättern */}
        <AnimatePresence>
          {showProjectOrbs &&
            projectsToShow.map((project, idx) => {
              const pos = ORB_LAYOUT[idx];
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
                  initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.1 }}
                  animate={{
                    opacity: 1,
                    x: "-50%",
                    y: "-50%",
                    scale: isFocused ? pos.scale * 1.2 : pos.scale,
                  }}
                  exit={{ opacity: 0, scale: 0.1, x: "-50%", y: "-50%" }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: "clamp(120px, 14vw, 220px)",
                    height: "clamp(120px, 14vw, 220px)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    zIndex: 15 + Math.round(pos.y),
                    transformOrigin: "center center",
                    filter:
                      "drop-shadow(0 14px 18px rgba(0, 15, 8, 0.55)) drop-shadow(0 4px 6px rgba(0, 20, 12, 0.7))",
                  }}
                >
                  <img
                    src={`/media/hero-v2/${orbFile}`}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                </motion.button>
              );
            })}
        </AnimatePresence>

        {/* LAYER 5 — Projekt-Hover-Card */}
        <AnimatePresence>
          {phase === "hover-project" && focused && focusedIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
              className="absolute z-40 w-[260px] rounded-xl bg-white/98 p-5 shadow-2xl"
              style={{
                left: "50%",
                top: "8%",
                transform: "translate(-50%, 0)",
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

        {/* LAYER 6 — Click-Splash Vollbild beim Projekt-Klick */}
        <AnimatePresence>
          {clickSplash.active && (
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
                <source src={SPLASH_VIDEO} type="video/mp4" />
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
                    {clickSplash.project?.title || "Projekt"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
