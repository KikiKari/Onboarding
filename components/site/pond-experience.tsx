"use client";

/**
 * Pond Experience V2 — Voll-Viewport Foto/Video-Hero.
 *
 * Aufbau:
 * - Layer 1: Loop-Video (Sora Pro) als Hintergrund (autoplay, muted, loop)
 * - Layer 2: Splash-Video-Overlay (nur sichtbar während "splashing"-Phase)
 * - Layer 3: PNG-Sprite-Overlays für Master-Orb und 9 Projekt-Kugeln, animiert mit Framer Motion
 * - Layer 4: HTML-Text-Overlay (Headline, Beschreibung, Vorschau-Card)
 *
 * State Machine:
 *   idle → rolling → splashing → emerging → distributed → focused
 *
 * Interaktion:
 * - Hover auf Master-Orb → startet Sequenz
 * - Klick auf Master-Orb → GitHub Main Repo
 * - Hover auf Projekt-Kugel → Vorschau-Card
 * - Klick auf Projekt-Kugel → GitHub Branch
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { heroPond, projects } from "@/content";

type Project = (typeof projects)[number];

type Phase = "idle" | "rolling" | "splashing" | "emerging" | "distributed" | "focused";

interface OrbPosition {
  /** Kreisförmige Verteilung der 9 Kugeln, in Prozent des Viewports. */
  x: number;
  y: number;
  scale: number;
  z: number;
}

/** 9 Ruhepositionen der Projekt-Kugeln — kreisförmig um Bildmitte. */
function buildOrbLayout(): OrbPosition[] {
  const positions: OrbPosition[] = [];
  const centerX = 50;
  const centerY = 55;
  const radiusX = 30;
  const radiusY = 18;
  for (let i = 0; i < 9; i++) {
    // 12-Uhr-Position beginnen, im Uhrzeigersinn
    const angle = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radiusX;
    const y = centerY + Math.sin(angle) * radiusY;
    // Vordere Kugeln (y > centerY) größer und weiter vorne
    const depthFactor = (y - centerY) / radiusY;
    const scale = 0.75 + 0.35 * (depthFactor + 1) / 2;
    const z = Math.round(depthFactor * 10);
    positions.push({ x, y, scale, z });
  }
  return positions;
}

export function PondExperience() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduceMotion ? "distributed" : "idle");
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [splashFrame, setSplashFrame] = useState(0);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const splashVideoRef = useRef<HTMLVideoElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const orbLayout = useMemo(buildOrbLayout, []);
  const projectsToShow: Project[] = projects.slice(0, 9);

  // Story-Sequenz starten
  function startSequence() {
    if (reduceMotion || phase !== "idle") return;
    setPhase("rolling");
    const t1 = setTimeout(() => {
      setPhase("splashing");
      splashVideoRef.current?.play().catch(() => {});
      // PNG-Sequenz parallel: 5 Frames à 100ms
      let frame = 0;
      const frameInterval = setInterval(() => {
        frame += 1;
        setSplashFrame(frame);
        if (frame >= 4) clearInterval(frameInterval);
      }, 100);
    }, 1200);
    const t2 = setTimeout(() => setPhase("emerging"), 2400);
    const t3 = setTimeout(() => setPhase("distributed"), 3800);
    timersRef.current.push(t1, t2, t3);
  }

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const focused = focusedIdx !== null ? projectsToShow[focusedIdx] : null;

  return (
    <section
      className="relative w-screen -ml-[calc(50vw-50%)] overflow-hidden bg-black"
      style={{ height: "100vh" }}
      aria-label="Interaktiver Teich mit Projektkugeln"
      data-pond-phase={phase}
    >
      {/* Layer 1: Loop-Video Hintergrund */}
      <video
        ref={loopVideoRef}
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

      {/* Layer 2: Splash-Video Overlay */}
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

      {/* Layer 2b: Splash-Frames als Fallback / zusätzliche Betonung */}
      {phase === "splashing" && splashFrame > 0 && (
        <img
          src={`/media/hero-v2/splash/splash-${Math.min(splashFrame + 1, 5)}.png`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-screen pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Layer 3a: Master-Orb (nur idle + rolling) */}
      <AnimatePresence>
        {(phase === "idle" || phase === "rolling") && (
          <motion.button
            type="button"
            onClick={() => window.open(heroPond.masterLink.href, "_blank", "noopener,noreferrer")}
            onMouseEnter={startSequence}
            onFocus={startSequence}
            aria-label={heroPond.masterLink.label}
            className="focus-ring absolute z-20 cursor-pointer rounded-full"
            initial={{ opacity: 0, x: "-15vw", y: "0vh" }}
            animate={
              phase === "idle"
                ? { opacity: 1, x: "-15vw", y: "0vh", rotate: 0 }
                : { opacity: 1, x: "0vw", y: "10vh", rotate: 720, scale: 0.5 }
            }
            exit={{ opacity: 0, scale: 0.2 }}
            transition={{ duration: phase === "rolling" ? 1.2 : 0.6, ease: "easeInOut" }}
            style={{
              left: "50%",
              top: "45%",
              width: "clamp(140px, 18vw, 300px)",
              height: "clamp(140px, 18vw, 300px)",
              transform: "translate(-50%, -50%)",
              background: "transparent",
              border: "none",
              padding: 0,
            }}
          >
            <img
              src="/media/hero-v2/kugeln/master.png"
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              draggable={false}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Layer 3b: 9 Projekt-Kugeln (nach Splash) */}
      <AnimatePresence>
        {(phase === "emerging" || phase === "distributed" || phase === "focused") &&
          projectsToShow.map((project, idx) => {
            const pos = orbLayout[idx];
            const isFocused = focusedIdx === idx;
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
                onClick={() => window.open(project.github, "_blank", "noopener,noreferrer")}
                aria-label={`${project.title} — ${project.platform}`}
                className="focus-ring absolute z-10 cursor-pointer rounded-full"
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
                  width: "clamp(80px, 10vw, 180px)",
                  height: "clamp(80px, 10vw, 180px)",
                  transform: "translate(-50%, -50%)",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  zIndex: 10 + pos.z,
                }}
              >
                <img
                  src={`/media/hero-v2/kugeln/orb-0${idx + 1}.png`}
                  alt=""
                  className="h-full w-full object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                  draggable={false}
                />
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* Layer 4a: Headline + Beschreibung (idle) */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pointer-events-none absolute left-1/2 top-[15%] z-30 w-full max-w-[52rem] -translate-x-1/2 px-6 text-center"
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

      {/* Layer 4b: Fokussierte Projekt-Vorschau-Card */}
      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-40 w-[min(90vw,32rem)] -translate-x-1/2 rounded-[var(--radius-md)] border border-white/20 bg-black/70 p-6 text-white backdrop-blur-md"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-1 rounded-[var(--radius-pill)] border border-white/30 bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
              >
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

      {/* Layer 4c: Debug (dev only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="pointer-events-none absolute right-3 top-3 z-50 rounded bg-black/70 px-2 py-1 font-mono text-[10px] text-white">
          {phase}
          {focusedIdx !== null ? ` · orb-${focusedIdx + 1}` : ""}
        </div>
      )}

      {/* Reset-Zone: Klick auf freies Wasser bei distributed → zurück zu idle */}
      {(phase === "distributed" || phase === "focused") && (
        <button
          type="button"
          onClick={() => {
            if (phase === "distributed") {
              setPhase("idle");
              setSplashFrame(0);
              setFocusedIdx(null);
            }
          }}
          aria-label="Sequenz zurücksetzen"
          className="absolute inset-0 z-0 cursor-default"
          style={{ background: "transparent", border: "none" }}
          tabIndex={-1}
        />
      )}
    </section>
  );
}
