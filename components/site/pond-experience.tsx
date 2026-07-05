"use client";

/**
 * Pond Experience V7 — Statisches Bild + Layer-Animation.
 *
 * BÜHNE:
 *   Layer 1: pond-background.png (klares Wasser + 2 Lotus-Blätter, kein Blüten/Kugeln)
 *   Layer 2: 12 hyperrealistische Seerosen als PNG-Layer, jede wippt individuell
 *            (verschiedene Phase, Amplitude, leichte Rotation → schwimmt freischwimmend)
 *   Layer 3: Master-Kugel-Klickbox auf linkem Blatt (HD-PNG)
 *   Layer 4: 9 Projekt-Kugeln auf rechtem Blatt (nach Master-Klick)
 *
 * KEIN Video mehr. Statisches Bild + CSS/Framer-Motion.
 * Blüten schwimmen frei um die Blätter herum — keine auf den Blättern.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { heroPond, projects } from "@/content";

type Project = (typeof projects)[number];

type Phase = "idle" | "hover-master" | "distributed" | "hover-project" | "click-splash";

/** Blüten-Positionen: 12 Blüten verteilt im freien Wasser rund um die Blätter.
 *  Blatt-Zonen (freihalten):
 *    Links Blatt: 8-33% x, 55-88% y
 *    Rechts Blatt: 62-92% x, 50-77% y
 *  Blüten schwimmen frei: oben (5-45% y) & im Wasser zwischen den Blättern & am Rand.
 */
const LILY_LAYOUT = [
  // Obere Reihe (weit hinten, kleiner)
  { x: 12, y: 18, size: 8, phase: 0.0, file: "lily-01-magenta.png" },
  { x: 32, y: 12, size: 9, phase: 0.4, file: "lily-02-yellow.png" },
  { x: 55, y: 8, size: 10, phase: 0.8, file: "lily-03-coral.png" },
  { x: 78, y: 14, size: 9, phase: 1.2, file: "lily-04-white.png" },
  { x: 92, y: 22, size: 8, phase: 1.6, file: "lily-05-lavender.png" },
  // Mittlere Reihe (rechts vom linken Blatt, links vom rechten Blatt, oben Mitte)
  { x: 45, y: 32, size: 11, phase: 2.0, file: "lily-06-crimson.png" },
  { x: 62, y: 35, size: 10, phase: 2.4, file: "lily-07-palepink.png" },
  { x: 5, y: 38, size: 10, phase: 2.8, file: "lily-08-champagne.png" },
  // Zwischen den Blättern & am unteren Rand (grösser, vorne)
  { x: 46, y: 60, size: 13, phase: 3.2, file: "lily-09-fuchsia.png" },
  { x: 52, y: 88, size: 12, phase: 3.6, file: "lily-10-orange.png" },
  { x: 18, y: 92, size: 11, phase: 4.0, file: "lily-11-blush.png" },
  { x: 83, y: 90, size: 12, phase: 4.4, file: "lily-12-salmon.png" },
] as const;

/** Master-Kugel auf linkem Lotus-Blatt (Zentrum ~20%/72%) */
const MASTER = {
  left: "20%",
  top: "72%",
  size: "clamp(140px, 12vw, 220px)",
};

/** 9 Projekt-Kugeln auf rechtem Blatt (Zentrum ~77%/62%, x=62-92%, y=50-77%) */
const ORB_LAYOUT = [
  { x: 66, y: 54, scale: 0.65 },
  { x: 77, y: 52, scale: 0.75 },
  { x: 88, y: 54, scale: 0.65 },
  { x: 64, y: 62, scale: 0.75 },
  { x: 77, y: 62, scale: 0.9 },
  { x: 90, y: 62, scale: 0.75 },
  { x: 67, y: 70, scale: 0.7 },
  { x: 77, y: 72, scale: 0.85 },
  { x: 87, y: 70, scale: 0.7 },
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

const SPLASH_VIDEO = "/media/hero-v2/videos/rolling-splash-v3.mp4";
const BG_IMAGE = "/media/hero-v2/pond-background.png";

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
        {/* LAYER 1 — Teich-Hintergrund (Wasser + 2 Blätter) */}
        <img
          src={BG_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
          draggable={false}
        />

        {/* LAYER 2 — 12 hyperrealistische Seerosen, jede wippt individuell */}
        {LILY_LAYOUT.map((lily, idx) => (
          <motion.div
            key={`lily-${idx}`}
            aria-hidden="true"
            className="absolute pointer-events-none"
            initial={false}
            animate={{
              // Wippen: leichte Y-Bewegung + subtile Rotation
              y: [0, -6, 0, 4, 0],
              rotate: [0, 1.5, 0, -1.5, 0],
            }}
            transition={{
              duration: 6 + (idx % 4),
              delay: lily.phase,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${lily.x}%`,
              top: `${lily.y}%`,
              width: `${lily.size}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 5 + Math.round(lily.y / 10),
              // Weicher Wasser-Kontakt-Schatten unter der Blüte
              filter:
                "drop-shadow(0 4px 8px rgba(20, 40, 60, 0.35)) drop-shadow(0 1px 2px rgba(0, 15, 30, 0.5))",
            }}
          >
            <img
              src={`/media/hero-v2/lilies/${lily.file}`}
              alt=""
              className="h-auto w-full object-contain"
              draggable={false}
            />
          </motion.div>
        ))}

        {/* LAYER 3 — Master-Kugel-Overlay auf linkem Blatt */}
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
              className="focus-ring absolute z-20 cursor-pointer"
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
                filter:
                  "drop-shadow(0 18px 22px rgba(0,15,8,0.55)) drop-shadow(0 6px 8px rgba(0,20,12,0.7))",
              }}
            >
              <img
                src="/media/hero-v2/glass-orbs-v2/orb-05-clear.png"
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
              <span className="sr-only">{heroPond.masterLink.label}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* LAYER 4 — Master-Hover-Card */}
        <AnimatePresence>
          {phase === "idle" && masterHovered && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute z-30 w-[280px] rounded-xl bg-white/98 p-5 shadow-2xl"
              style={{
                left: `calc(${MASTER.left} + 15vw)`,
                top: MASTER.top,
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

        {/* LAYER 5 — 9 Projekt-Kugeln auf rechtem Blatt */}
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
                    delay: idx * 0.07,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: "clamp(120px, 15vw, 220px)",
                    height: "clamp(120px, 15vw, 220px)",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    zIndex: 20 + Math.round(pos.y),
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

        {/* LAYER 6 — Projekt-Hover-Card */}
        <AnimatePresence>
          {phase === "hover-project" && focused && focusedIdx !== null && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute z-40 w-[260px] rounded-xl bg-white/98 p-5 shadow-2xl"
              style={{
                left: `calc(${ORB_LAYOUT[focusedIdx].x}% - 18vw)`,
                top: `${ORB_LAYOUT[focusedIdx].y}%`,
                transform: "translate(0, -50%)",
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

        {/* LAYER 7 — Click-Splash Vollbild */}
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
