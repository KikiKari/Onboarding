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

/**
 * Einheitliche Konfiguration - EIN konstanter Hintergrund für die ganze Story:
 * Landing-Video läuft in Loop, Splash ist nur ein Overlay darüber. Nach dem Splash
 * bleibt derselbe Hintergrund sichtbar mit den 9 Kugeln auf dem linken Blatt
 * (dort wo der Master war).
 */
const POND_CONFIG = {
  hero: "/media/hero-v2/videos/pond-idle-A.mp4",
  splash: "/media/hero-v2/videos/rolling-splash-v3.mp4",
  // Master-Orb auf dem LINKEN Blatt - exakt über der Video-Kugel positioniert.
  // Aus Screenshot mit 16:9 Stage exakt gemessen: Video-Kugel bei 32% x / 51% y.
  // Kleinere Hitbox (140px cap) damit sie nicht über die Kugelgrenzen hinausragt.
  masterPosition: { left: "32%", top: "51%", size: "clamp(90px, 8vw, 140px)" },
  // 9 Kugeln auf dem RECHTEN Blatt - unregelmäßig verteilt in Ellipse.
  // Blatt-Ellipse: Zentrum (73, 55), Halbachsen (17, 12) -> alle 9 Kugeln sicher DRAUF.
  // Sortiert von hinten nach vorne (y-aufsteigend) für korrekte visuelle Tiefe.
  orbLayout: [
    { x: 76.1, y: 44.6, scale: 0.38, z: 2 },
    { x: 64.1, y: 48.9, scale: 0.42, z: 3 },
    { x: 86.6, y: 51.4, scale: 0.40, z: 2 },
    { x: 76.0, y: 52.0, scale: 0.48, z: 4 },
    { x: 69.5, y: 55.4, scale: 0.52, z: 5 },
    { x: 62.3, y: 57.0, scale: 0.46, z: 4 },
    { x: 87.8, y: 58.3, scale: 0.55, z: 6 },
    { x: 79.3, y: 58.9, scale: 0.50, z: 5 },
    { x: 72.7, y: 65.4, scale: 0.58, z: 7 },
  ] as OrbPosition[],
} as const;

/** Neue Glaskugeln V2 via gpt-image-2 mit master.png als Referenz - konsistenter Look mit Master */
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

export function PondExperience() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "distributed" : "idle");
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [masterHovered, setMasterHovered] = useState(false);
  const [splashActive, setSplashActive] = useState(false);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const clickSplashRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const config = POND_CONFIG;
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



  // Master anklicken → Story-Sequenz OHNE sichtbaren BG-Wechsel:
  //   1. SOFORT: Splash-Video-Overlay startet und bedeckt binnen 300ms den Screen.
  //   2. Unter dem Splash (unsichtbar): BG wechselt zu Phase-4 (rechtes Blatt).
  //   3. Während Splash noch läuft: 9 Kugeln erscheinen bereits im Hintergrund.
  //   4. Splash klingt ab, gibt Blick frei auf die 9 Kugeln.
  function onMasterClick() {
    if (reduceMotion) {
      setPhase("distributed");
      return;
    }
    if (phase !== "idle" && phase !== "hover-master") return;

    setMasterHovered(false);

    // Story-Flow: das Splash-Video zeigt selbst die rollende Kugel, also
    // sofort einblenden - keine sichtbare Wartezeit zwischen Klick und Rollen.
    //  0ms:    Master-Hitbox verschwindet, Splash-Video startet direkt
    //  4200ms: 9 Kugeln beginnen einzublenden (unter noch aktivem Splash)
    //  5000ms: Splash-Video zu Ende, fadet aus

    setPhase("splashing");
    setSplashActive(true);
    // Video sofort abspielen (nächster Frame - React hat den Ref bereits gerendert)
    requestAnimationFrame(() => {
      splashVideoRef.current?.play().catch(() => {});
    });

    const t2 = setTimeout(() => setPhase("distributed"), 4200);
    const t3 = setTimeout(() => setSplashActive(false), 5000);

    timersRef.current.push(t2, t3);
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

  // Sichtbarkeit der Layer (Hero-BG ist immer da, kein Toggle)
  const showSplash = splashActive;
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
      {/*
       * STAGE: inner 16:9 container that mirrors the video's `object-cover` crop.
       * All absolute positions (%-based) reference THIS box, so master orb & the 9
       * project orbs stay locked to the pond image at every viewport aspect ratio.
       *
       * Sizing rule matches object-cover for a 16/9 source:
       *   - viewport wider than 16:9  → height = 100vh, width = (16/9)*100vh, centered horizontally
       *   - viewport taller than 16:9 → width  = 100vw, height = (9/16)*100vw, centered vertically
       */}
      <div
        className="pond-stage absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, calc(100vh * 16 / 9))",
          height: "max(100vh, calc(100vw * 9 / 16))",
        }}
      >
      {/* LAYER 1: Hero-Hintergrund - IMMER sichtbar durch alle Phasen (konstant) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-fill"
        aria-hidden="true"
      >
        <source src={config.hero} type="video/mp4" />
      </video>

      {/* LAYER 2: Splash-Video (Overlay, positioniert wo der Master lag) */}
      <AnimatePresence>
        {showSplash && (
          <motion.video
            ref={splashVideoRef}
            muted
            playsInline
            autoPlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 z-30 h-full w-full object-fill"
            aria-hidden="true"
          >
            <source src={config.splash} type="video/mp4" />
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
            animate={{ opacity: 1, scale: masterHovered ? 1.05 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
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
            {/* Master-Orb-Button: reine Hitbox für Klick/Hover.
                Die im Idle-Video eingebettete Kugel bleibt visuell sichtbar.
                KEIN Rolling-Sprite - das Splash-Video zeigt selbst die rollende Kugel. */}
            <span className="sr-only" style={{ pointerEvents: "none" }}>
              {heroPond.masterLink.label}
            </span>
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
                  src={`/media/hero-v2/${orbFile}`}
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
      </div>
    </section>
  );
}
