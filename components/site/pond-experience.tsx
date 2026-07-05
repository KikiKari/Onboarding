"use client";

/**
 * Pond Experience V3 — Voll-Viewport mit echten Glaskugel-Sprites.
 *
 * Basis: element_03_single_bead.png (saubere transparente Glaskugel),
 * 9 Farbvarianten via HSV-Hue-Shift, Master-Orb als warme Kupfer-Variante.
 *
 * Header ist im Hero-Bereich (100vh) verborgen (via CSS body attribute).
 *
 * Klick auf Projekt-Kugel → vollflächiges Splash-Video (Veo Fast) → Weiterleitung
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { heroPond, projects } from "@/content";

type Project = (typeof projects)[number];

type Phase =
  | "idle"
  | "rolling"
  | "splashing"
  | "emerging"
  | "distributed"
  | "focused"
  | "click-splash";

interface OrbPosition {
  x: number;
  y: number;
  scale: number;
  z: number;
}

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

function buildOrbLayout(): OrbPosition[] {
  const positions: OrbPosition[] = [];
  const centerX = 50;
  const centerY = 55;
  const radiusX = 32;
  const radiusY = 20;
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    const depthFactor = (y - centerY) / radiusY;
    const scale = 0.7 + 0.4 * (depthFactor + 1) / 2;
    const z = Math.round(depthFactor * 10);
    positions.push({ x, y, scale, z });
  }
  return positions;
}

export function PondExperience() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "distributed" : "idle");
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const clickSplashRef = useRef<HTMLVideoElement>(null);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const orbLayout = useMemo(buildOrbLayout, []);
  const projectsToShow: Project[] = projects.slice(0, 9);

  // Header im Hero-Bereich verstecken via CSS-Attribut auf body.
  // Sichtbar sobald der User mehr als 90vh gescrollt hat.
  useEffect(() => {
    const updateHeader = () => {
      const threshold = window.innerHeight * 0.9;
      if (window.scrollY < threshold) {
        document.body.setAttribute("data-hero-immersive", "true");
      } else {
        document.body.removeAttribute("data-hero-immersive");
      }
      // PondExperience Opacity abhängig vom Scroll (100vh Fade-Out)
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const opacity = Math.max(0, Math.min(1, 1 - scrollY / (vh * 0.9)));
      setHeroOpacity(opacity);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateHeader);
      document.body.removeAttribute("data-hero-immersive");
    };
  }, []);

  // Story-Sequenz starten (Master-Orb-Hover)
  function startSequence() {
    if (reduceMotion || phase !== "idle") return;
    setPhase("rolling");
    const t1 = setTimeout(() => {
      setPhase("splashing");
      splashVideoRef.current?.play().catch(() => {});
    }, 1200);
    const t2 = setTimeout(() => setPhase("emerging"), 2400);
    const t3 = setTimeout(() => setPhase("distributed"), 3800);
    timersRef.current.push(t1, t2, t3);
  }

  // Klick auf Projekt-Kugel: Splash-Video vollflächig + delayed Weiterleitung
  function onProjectClick(project: Project) {
    if (reduceMotion) {
      window.open(project.github, "_blank", "noopener,noreferrer");
      return;
    }
    setPhase("click-splash");
    // Video abspielen
    setTimeout(() => {
      clickSplashRef.current?.play().catch(() => {});
    }, 50);
    // Nach 2.8s Weiterleitung
    const t = setTimeout(() => {
      if (project.github) {
        window.open(project.github, "_blank", "noopener,noreferrer");
      }
      // Zurück zur distributed-Phase nach Weiterleitung
      const t2 = setTimeout(() => {
        setPhase("distributed");
      }, 500);
      timersRef.current.push(t2);
    }, 2800);
    timersRef.current.push(t);
  }

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const focused = focusedIdx !== null ? projectsToShow[focusedIdx] : null;

  return (
    <section
      className="fixed inset-0 z-0 w-screen overflow-hidden bg-black"
      style={{ height: "100vh", opacity: heroOpacity, pointerEvents: heroOpacity < 0.1 ? "none" : "auto" }}
      aria-label="Interaktiver Teich mit Projektkugeln"
      data-pond-phase={phase}
    >
      {/* Layer 1: Loop-Video Hintergrund */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src="/media/hero-v2/videos/pond-loop.mp4" type="video/mp4" />
      </video>

      {/* Layer 2: Master-Splash-Video (bei Sequenz-Start) */}
      <AnimatePresence>
        {phase === "splashing" && (
          <motion.video
            ref={splashVideoRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
            aria-hidden="true"
          >
            <source src="/media/hero-v2/videos/splash.mp4" type="video/mp4" />
          </motion.video>
        )}
      </AnimatePresence>

      {/* Layer 3: Master-Orb (idle + rolling) */}
      <AnimatePresence>
        {(phase === "idle" || phase === "rolling") && (
          <motion.button
            type="button"
            onClick={() => window.open(heroPond.masterLink.href, "_blank", "noopener,noreferrer")}
            onMouseEnter={startSequence}
            onFocus={startSequence}
            aria-label={heroPond.masterLink.label}
            className="focus-ring absolute z-20 cursor-pointer"
            initial={{ opacity: 0, x: "-15vw", y: "0vh", rotate: 0 }}
            animate={
              phase === "idle"
                ? { opacity: 1, x: "-15vw", y: "0vh", rotate: 0, scale: 1 }
                : { opacity: 0, x: "0vw", y: "10vh", rotate: 720, scale: 0.3 }
            }
            exit={{ opacity: 0, scale: 0.1 }}
            transition={{ duration: phase === "rolling" ? 1.2 : 0.6, ease: "easeInOut" }}
            style={{
              left: "50%",
              top: "45%",
              width: "clamp(220px, 28vw, 480px)",
              height: "clamp(220px, 28vw, 480px)",
              transform: "translate(-50%, -50%)",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            <img
              src="/media/hero-v2/kugeln-v2/master.png"
              alt=""
              className="h-full w-full object-contain"
              draggable={false}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Layer 4: 9 Projekt-Kugeln */}
      <AnimatePresence>
        {(phase === "emerging" || phase === "distributed" || phase === "focused") &&
          projectsToShow.map((project, idx) => {
            const pos = orbLayout[idx];
            const isFocused = focusedIdx === idx;
            const orbFile = ORB_FILES[idx];
            return (
              <motion.button
                key={project.slug}
                type="button"
                onMouseEnter={() => {
                  setFocusedIdx(idx);
                  setPhase("focused");
                }}
                onMouseLeave={() => {
                  setFocusedIdx(null);
                  setPhase("distributed");
                }}
                onFocus={() => {
                  setFocusedIdx(idx);
                  setPhase("focused");
                }}
                onClick={() => onProjectClick(project)}
                aria-label={`${project.title} — ${project.platform}`}
                className="focus-ring absolute cursor-pointer"
                initial={{
                  opacity: 0,
                  left: "50%",
                  top: "60%",
                  scale: 0.1,
                }}
                animate={{
                  opacity: 1,
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  scale: isFocused ? pos.scale * 1.25 : pos.scale,
                }}
                exit={{ opacity: 0, scale: 0.1 }}
                transition={{
                  duration: phase === "emerging" ? 1.2 : 0.4,
                  delay: phase === "emerging" ? idx * 0.08 : 0,
                  ease: "easeOut",
                }}
                style={{
                  width: "clamp(90px, 12vw, 200px)",
                  height: "clamp(90px, 12vw, 200px)",
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

      {/* Layer 5: Vollflächiger Klick-Splash bei Projekt-Auswahl */}
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
              <source src="/media/hero-v2/videos/click-splash.mp4" type="video/mp4" />
            </video>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-70">Öffne</p>
                <p className="mt-3 font-[var(--font-display)] text-3xl">
                  {focused?.title || "Projekt"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 6: Headline im Idle-Zustand */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pointer-events-none absolute left-1/2 top-[12%] z-30 w-full max-w-[52rem] -translate-x-1/2 px-6 text-center"
          >
            <h1 className="font-[var(--font-display)] text-[clamp(2.5rem,6vw,5rem)] font-normal leading-[1.05] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              {heroPond.masterLink.description}
            </h1>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-white/80">
              Bewege den Cursor über die Kugel
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 7: Fokussierte Projekt-Vorschau-Card */}
      <AnimatePresence>
        {focused && phase === "focused" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-40 w-[min(90vw,32rem)] -translate-x-1/2 rounded-[var(--radius-md)] border border-white/20 bg-black/70 p-6 text-white backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 rounded-[var(--radius-pill)] border border-white/30 bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider">
                {focused.platform}
              </span>
              <div className="flex-1">
                <h2 className="font-[var(--font-display)] text-2xl font-normal leading-tight">
                  {focused.title}
                </h2>
                <p className="mt-2 text-sm text-white/80">{focused.summary}</p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-white/60">
                  Klicken zum Öffnen →
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="pointer-events-none absolute right-3 top-3 z-50 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white">
          {phase}
          {focusedIdx !== null ? ` · orb-${focusedIdx + 1}` : ""}
        </div>
      )}
    </section>
  );
}
