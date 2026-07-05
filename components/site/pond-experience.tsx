"use client";

/**
 * Pond Experience V5 — Drei-Video-Story mit echten Kugeln im Video.
 *
 * BÜHNEN (jeweils eigenes Video, cross-faded):
 *   Stage 1 IDLE       → pond-loop.mp4 (Loop) + HD-Master-PNG Overlay auf linkem Blatt
 *   Stage 2 SPLASH     → rolling-splash-v3.mp4 (play once, 5s) — echte Kugel rollt & splasht
 *   Stage 3 DISTRIBUTED→ distributed-loop-C.mp4 (Loop) — 9 echte Glas-Kugeln im Video,
 *                        unsichtbare Klickboxen exakt auf ihren Positionen.
 *
 * Übergang zwischen Bühnen: 500ms Cross-fade der beiden <video>-Layer.
 * KEIN CSS-Wasser-Splash, KEIN Weissblende, KEIN Sora-Kugel-Sprung.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { heroPond, projects } from "@/content";

type Project = (typeof projects)[number];

type Stage = "idle" | "splash" | "distributed";

interface OrbHitbox {
  /** Bildmitte der echten Video-Kugel in % (x, y) */
  x: number;
  y: number;
  /** Klickbox-Grösse in vh — proportional zur echten Kugel */
  size: number;
}

/**
 * Positionen exakt gemessen aus distributed-loop-C.mp4 Frame @ t=4s:
 * 9 echte Glas-Kugeln, hinten kleiner (Z-Distance), vorne grösser.
 * Der Klickbereich ist ein transparenter Kreis über jeder echten Kugel.
 */
const PROJECT_HITBOXES: OrbHitbox[] = [
  { x: 21, y: 78, size: 12 }, // vorne links, gross
  { x: 30, y: 82, size: 12 }, // vorne mitte-links, gross
  { x: 33, y: 68, size: 8 }, // hinten links, mittel
  { x: 38, y: 79, size: 10 }, // mittig-vorne
  { x: 43, y: 72, size: 9 }, // mittig-hinten
  { x: 48, y: 65, size: 7 }, // ganz hinten
  { x: 50, y: 78, size: 10 }, // vorne rechts der Gruppe
  { x: 78, y: 62, size: 6 }, // rechts hinten (rechtes Blatt)
  { x: 82, y: 68, size: 8 }, // rechts vorne (rechtes Blatt)
];

/**
 * Master-Kugel-Overlay-Position auf pond-loop Frame 0:
 * Linkes Blatt Zentrum ≈ 32% x, 62% y.
 */
const MASTER_POSITION = {
  left: "32%",
  top: "62%",
  size: "clamp(140px, 12vw, 220px)",
};

const VIDEOS = {
  idle: "/media/hero-v2/videos/pond-loop.mp4",
  splash: "/media/hero-v2/videos/rolling-splash-v3.mp4",
  distributed: "/media/hero-v2/videos/distributed-loop-C.mp4",
} as const;

const SPLASH_DURATION_MS = 5000; // rolling-splash-v3 ist 5s

export function PondExperience() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduceMotion ? "distributed" : "idle");
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [masterHovered, setMasterHovered] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [clickSplash, setClickSplash] = useState<{ active: boolean; project: Project | null }>({
    active: false,
    project: null,
  });

  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const distributedVideoRef = useRef<HTMLVideoElement>(null);
  const clickSplashRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const projectsToShow: Project[] = projects.slice(0, 9);

  // Immersive Header
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

  // Splash-Video: bei Stage-Wechsel abspielen, danach zu Distributed wechseln
  useEffect(() => {
    if (stage !== "splash") return;
    const v = splashVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    const t = setTimeout(() => {
      setStage("distributed");
    }, SPLASH_DURATION_MS);
    timersRef.current.push(t);
  }, [stage]);

  // Distributed-Video: sicherstellen, dass es läuft wenn sichtbar
  useEffect(() => {
    if (stage !== "distributed") return;
    const v = distributedVideoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [stage]);

  function onMasterClick() {
    if (reduceMotion) {
      setStage("distributed");
      return;
    }
    if (stage !== "idle") return;
    setMasterHovered(false);
    setStage("splash");
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

  return (
    <section
      className="fixed inset-0 z-0 w-screen overflow-hidden bg-black"
      style={{
        height: "100vh",
        opacity: heroOpacity,
        pointerEvents: heroOpacity < 0.1 ? "none" : "auto",
      }}
      aria-label="Interaktiver Teich mit Projektkugeln"
      data-pond-stage={stage}
    >
      {/* STAGE 16:9 Container — alle % beziehen sich hierauf */}
      <div
        className="pond-stage absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, calc(100vh * 16 / 9))",
          height: "max(100vh, calc(100vw * 9 / 16))",
        }}
      >
        {/* LAYER 1 — IDLE-VIDEO (pond-loop, ruhige Bühne, KEINE Kugel) */}
        <video
          ref={idleVideoRef}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          className="absolute inset-0 h-full w-full object-fill transition-opacity duration-500"
          style={{ opacity: stage === "idle" ? 1 : 0 }}
          aria-hidden="true"
        >
          <source src={VIDEOS.idle} type="video/mp4" />
        </video>

        {/* LAYER 2 — SPLASH-VIDEO (rolling-splash-v3, echte Kugel rollt & splasht) */}
        <video
          ref={splashVideoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-fill transition-opacity duration-500"
          style={{ opacity: stage === "splash" ? 1 : 0 }}
          aria-hidden="true"
        >
          <source src={VIDEOS.splash} type="video/mp4" />
        </video>

        {/* LAYER 3 — DISTRIBUTED-VIDEO (9 echte Glas-Kugeln im Video) */}
        <video
          ref={distributedVideoRef}
          muted
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 h-full w-full object-fill transition-opacity duration-500"
          style={{ opacity: stage === "distributed" ? 1 : 0 }}
          aria-hidden="true"
        >
          <source src={VIDEOS.distributed} type="video/mp4" />
        </video>

        {/* LAYER 4 — MASTER-ORB-OVERLAY (HD-PNG auf linkem Blatt, nur im Idle sichtbar) */}
        <AnimatePresence>
          {stage === "idle" && (
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
              exit={{ opacity: 0, x: "-50%", y: "-50%", transition: { duration: 0.3 } }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: MASTER_POSITION.left,
                top: MASTER_POSITION.top,
                width: MASTER_POSITION.size,
                height: MASTER_POSITION.size,
                background: "transparent",
                border: "none",
                padding: 0,
                transformOrigin: "center center",
                filter:
                  "drop-shadow(0 18px 22px rgba(0,15,8,0.55)) drop-shadow(0 6px 8px rgba(0,20,12,0.7))",
              }}
            >
              {/* Kontakt-Ellipse unterm Master */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "4%",
                  width: "70%",
                  height: "10%",
                  transform: "translateX(-50%)",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(ellipse, rgba(0,15,8,0.6) 0%, rgba(0,15,8,0.3) 45%, rgba(0,0,0,0) 75%)",
                  filter: "blur(4px)",
                  pointerEvents: "none",
                  zIndex: -1,
                }}
              />
              <img
                src="/media/hero-v2/glass-orbs-v2/orb-05-clear.png"
                alt=""
                className="h-full w-full object-contain"
                draggable={false}
              />
              <span className="sr-only" style={{ pointerEvents: "none" }}>
                {heroPond.masterLink.label}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* LAYER 5 — Master-Hover-Preview-Card */}
        <AnimatePresence>
          {stage === "idle" && masterHovered && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute z-30 w-[280px] rounded-xl bg-white/98 p-5 shadow-2xl"
              style={{
                left: `calc(${MASTER_POSITION.left} + 12vw)`,
                top: MASTER_POSITION.top,
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

        {/* LAYER 6 — 9 unsichtbare Klickboxen exakt auf den echten Video-Kugeln */}
        <AnimatePresence>
          {stage === "distributed" &&
            projectsToShow.map((project, idx) => {
              const box = PROJECT_HITBOXES[idx];
              const isFocused = focusedIdx === idx;
              return (
                <motion.button
                  key={project.slug}
                  type="button"
                  onMouseEnter={() => setFocusedIdx(idx)}
                  onMouseLeave={() => setFocusedIdx(null)}
                  onFocus={() => setFocusedIdx(idx)}
                  onBlur={() => setFocusedIdx(null)}
                  onClick={() => onProjectClick(project)}
                  aria-label={`${project.title} — ${project.platform}`}
                  className="focus-ring absolute cursor-pointer rounded-full"
                  initial={{ opacity: 0, x: "-50%", y: "-50%", scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    x: "-50%",
                    y: "-50%",
                    scale: isFocused ? 1.1 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.size}vh`,
                    height: `${box.size}vh`,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    zIndex: 15,
                    transformOrigin: "center center",
                  }}
                />
              );
            })}
        </AnimatePresence>

        {/* LAYER 7 — Projekt-Hover-Card */}
        <AnimatePresence>
          {stage === "distributed" && focused && focusedIdx !== null && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute z-40 w-[260px] rounded-xl bg-white/98 p-5 shadow-2xl"
              style={{
                left: `calc(${PROJECT_HITBOXES[focusedIdx].x}% + 6vw)`,
                top: `${PROJECT_HITBOXES[focusedIdx].y}%`,
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

        {/* LAYER 8 — Click-Splash beim Projekt-Klick (Vollbild-Splash-Video) */}
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
                <source src={VIDEOS.splash} type="video/mp4" />
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
