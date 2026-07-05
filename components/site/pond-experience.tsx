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
  // Ein einziges Story-Video (8.2s): Kugel liegt auf linkem Blatt, rollt nach
  // rechts, splasht ins Wasser, landet auf rechtem Blatt. Kein separates Splash.
  hero: "/media/hero-v2/videos/pond-story-v1.mp4",
  splash: "/media/hero-v2/videos/pond-story-v1.mp4",
  // Master-Orb-Position im ersten Frame: Kugel liegt bei ca. 30% / 60% - ist im
  // Video sichtbar. Wir platzieren dort eine transparente Klick-Hitbox drueber.
  masterPosition: { left: "30%", top: "60%", size: "clamp(160px, 13vw, 220px)" },
  // 9 Kugeln auf dem RECHTEN Blatt (Endframe des Story-Videos):
  // Blatt-Grenzen: x 44-67%, y 64-86%, Zentrum (56, 75).
  // 3D-Perspektive: hinten (kleines y) klein, vorne (grosses y) gross.
  orbLayout: [
    // HINTEN (klein, oben am Blatt)
    { x: 48.0, y: 66.5, scale: 0.20, z: 2 },
    { x: 55.5, y: 65.5, scale: 0.22, z: 3 },
    { x: 63.0, y: 66.5, scale: 0.20, z: 2 },
    // MITTE (mittelgross)
    { x: 46.5, y: 73.0, scale: 0.28, z: 4 },
    { x: 55.5, y: 72.5, scale: 0.32, z: 5 },
    { x: 64.5, y: 73.0, scale: 0.26, z: 4 },
    // VORNE (gross, unten am Blatt)
    { x: 49.0, y: 80.0, scale: 0.34, z: 6 },
    { x: 56.5, y: 82.0, scale: 0.40, z: 8 },
    { x: 64.0, y: 79.5, scale: 0.32, z: 6 },
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
  const heroVideoRef = useRef<HTMLVideoElement>(null);
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

    // Story-Flow mit vollflaechigem Weiss-Fade-Uebergang:
    //   0ms:    Weissblende beginnt sich vom Orb aus zu fuellen
    //  600ms:  Blende ist ~85% weiss, Splash-Video wird DAHINTER gestartet
    // 1400ms:  Blende faded runter, Rolling-Kugel im Splash wird sichtbar
    // 2500ms:  Blende komplett weg, nur noch Splash-Video sichtbar
    // 5000ms:  Splash-Video zu Ende, faded aus
    // 5300ms:  9 Kugeln steigen aus dem Wasser auf

    // Ein-Video-Story-Flow: Das Hero-Video ENTHAeLT bereits die komplette
    // Sequenz (Idle -> Roll -> Splash -> Landing). Vor Klick pausiert bei
    // Frame 0. Bei Klick spielt es ab. Am Video-Ende (8s) erscheinen die 9
    // Kugeln auf dem rechten Blatt.
    setPhase("splashing");
    const heroVideo = heroVideoRef.current;
    if (heroVideo) {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
    }

    // Nach Video-Ende (8s): 9 Kugeln erscheinen
    const t1 = setTimeout(() => setPhase("distributed"), 8000);
    timersRef.current.push(t1);
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
      {/* LAYER 1: Ein-Video-Story. Pausiert bei Frame 0 = Idle-Zustand mit
          Kugel auf linkem Blatt. Bei Klick spielt es einmal komplett ab und
          endet mit Kugel auf rechtem Blatt. Video hat KEINEN Ton (muted). */}
      <video
        ref={heroVideoRef}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-fill"
        aria-hidden="true"
        onLoadedMetadata={(e) => {
          // Direkt bei Frame 0 stehen bleiben (Idle-Zustand)
          const v = e.currentTarget;
          v.currentTime = 0;
          v.pause();
        }}
      >
        <source src={config.hero} type="video/mp4" />
      </video>

      {/* CSS-Regen entfernt: Video pond-idle-v2 hat bereits sichtbaren Regen
          mit realistischer Wasser-Interaktion. Der CSS-Overlay hat nur den
          Look mit unrealistischen Lichtpunkten gestoert. */}

      {/* LAYER 2: KEIN separates Splash-Video mehr. Das Hero-Video enthaelt
          bereits die komplette Splash-Sequenz. */}

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
            initial={{ opacity: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: masterHovered ? 1.15 : 1 }}
            exit={{ opacity: 0, x: "-50%", y: "-50%", transition: { duration: 0 } }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              left: config.masterPosition.left,
              top: config.masterPosition.top,
              width: config.masterPosition.size,
              height: config.masterPosition.size,
              background: "transparent",
              border: "none",
              padding: 0,
              transformOrigin: "center center",
            }}
          >
            {/* KEIN Hover-Glow-Ring mehr. Hover wird nur durch Scale 1.15 sichtbar
                gemacht (Master-Button waechst leicht). */}
            <span className="sr-only" style={{ pointerEvents: "none" }}>
              {heroPond.masterLink.label}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* KEIN CSS-Uebergangseffekt. Das Splash-Video macht den Uebergang komplett
          in sich selbst - Kugel rollt, spritzt, landet - gleicher Look wie Idle. */}

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
                // Kugeln steigen aus dem Wasser auf (top+10% -> top+0%),
                // versetzte Starts pro Kugel. Danach subtile Wasser-Wiegen-
                // Bewegung: minimal 0.3-0.5% um die Ruheposition, im Rhythmus
                // der Wasserwellen (4-6s pro Kugel individuell). Nutzt y-
                // Transform statt top - keine Layout-Rekalkulation, keine
                // Video-Ueberlagerung, weiche synchrone Bewegung.
                initial={{ opacity: 0, left: `${pos.x}%`, top: `${pos.y + 10}%`, scale: 0.05, x: "-50%", y: "-50%" }}
                animate={{
                  opacity: 1,
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  x: "-50%",
                  y: isFocused
                    ? "-50%"
                    : ["-50%", "-52%", "-49%", "-51%", "-50%"],
                  scale: isFocused ? pos.scale * 1.2 : pos.scale,
                }}
                exit={{ opacity: 0, scale: 0.05, x: "-50%", y: "-50%" }}
                transition={{
                  duration: isFocused ? 0.35 : 0.9,
                  delay: isFocused ? 0 : idx * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                  y: isFocused
                    ? { duration: 0.35 }
                    : {
                        duration: 5 + idx * 0.4,
                        delay: 1.2 + idx * 0.12,
                        repeat: Infinity,
                        repeatType: "loop" as const,
                        ease: "easeInOut",
                      },
                }}
                style={{
                  // Doppelt so gross wie vorher (80-160 -> 160-320) - Kugeln wie der Master.
                  width: "clamp(160px, 20vw, 300px)",
                  height: "clamp(160px, 20vw, 300px)",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  zIndex: 10 + pos.z,
                  transformOrigin: "center center",
                  // Kugel-Schatten (breit weich + eng dunkel) laesst die Kugel
                  // deutlich AUF dem Blatt sitzen.
                  filter:
                    "drop-shadow(0 14px 18px rgba(0, 15, 8, 0.55)) drop-shadow(0 4px 6px rgba(0, 20, 12, 0.7)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9))",
                }}
              >
                {/* Kontakt-Ellipse: dunkle weiche Scheibe direkt unter der Kugel,
                    wo sie das Blatt beruehrt - macht sie visuell erdgebunden. */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "6%",
                    width: "72%",
                    height: "12%",
                    transform: "translateX(-50%)",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse, rgba(0, 15, 8, 0.65) 0%, rgba(0, 15, 8, 0.35) 40%, rgba(0, 0, 0, 0) 75%)",
                    filter: "blur(3px)",
                    pointerEvents: "none",
                    zIndex: -1,
                  }}
                />
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
