"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const globeFrames = [1, 2, 3, 4, 5].map(
  (frame) => `/media/globe-frames/frame-${String(frame).padStart(2, "0")}.png`,
);

const projectOrbs = [
  { label: "Vision", href: "/projects/vision-check", x: -126, y: 118, size: 62, delay: 1.1, depth: 0.82, accent: "var(--accent-2)" },
  { label: "Weather", href: "/projects/weather-check", x: 126, y: 128, size: 55, delay: 1.5, depth: 0.76, accent: "var(--accent-3)" },
  { label: "Vault", href: "/projects/secret-vault-public", x: -76, y: 174, size: 48, delay: 1.9, depth: 0.67, accent: "var(--accent)" },
  { label: "ClawHub", href: "/projects/clawhub", x: 76, y: 182, size: 46, delay: 2.25, depth: 0.62, accent: "var(--accent-2)" },
  { label: "Status", href: "/projects/tagesstatus-live-public", x: -22, y: 202, size: 42, delay: 2.55, depth: 0.56, accent: "var(--accent-3)" },
] as const;

function ProjectOrb({ orb, reduce }: { orb: (typeof projectOrbs)[number]; reduce: boolean | null }) {
  const resting = { x: orb.x, y: orb.y, scale: orb.depth, opacity: 1 };
  return (
    <motion.div
      className="absolute left-1/2 top-[22%] z-20"
      initial={reduce ? resting : { x: 0, y: 0, scale: 0.12, rotate: 0, opacity: 0 }}
      animate={reduce ? resting : {
        x: [0, orb.x * 0.28, orb.x * 0.66, orb.x * 0.92, orb.x, orb.x],
        y: [0, -74, 32, 102, orb.y - 12, orb.y],
        scale: [0.12, 0.42, 0.72, orb.depth * 1.04, orb.depth, orb.depth],
        opacity: [0, 1, 1, 1, 1, 1],
      }}
      transition={reduce ? undefined : {
        duration: 2.9,
        delay: orb.delay,
        times: [0, 0.22, 0.5, 0.72, 0.88, 1],
        ease: [0.22, 0.61, 0.36, 1],
      }}
      style={{ width: orb.size, height: orb.size, marginLeft: -orb.size / 2, marginTop: -orb.size / 2 }}
    >
      <Link className="focus-ring group relative block size-full rounded-full" href={orb.href} aria-label={`${orb.label} öffnen`}>
        <span
          className="absolute left-[12%] top-[88%] h-[18%] w-[76%] rounded-full bg-black/40 blur-md"
          aria-hidden="true"
        />
        <motion.span
          className="absolute inset-0 overflow-hidden rounded-full border border-white/70 bg-white/20 shadow-[inset_0_3px_10px_rgba(255,255,255,.9),inset_0_-8px_18px_rgba(46,125,123,.18),0_10px_22px_-8px_rgba(27,26,23,.55)] backdrop-blur-sm transition group-hover:scale-110"
          animate={reduce ? undefined : { rotate: [0, orb.x < 0 ? -360 : 360] }}
          transition={reduce ? undefined : { duration: 2.9, delay: orb.delay, ease: "easeOut" }}
        >
          <Image src="/media/glass-orb.png" alt="" fill className="object-cover opacity-75 mix-blend-screen" sizes="64px" />
          <span className="absolute inset-[18%] rounded-full border opacity-75" style={{ borderColor: orb.accent }} />
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,.95),transparent_16%)]" />
        </motion.span>
        <span className="absolute left-1/2 top-[108%] -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-pill)] bg-bg/80 px-2 py-0.5 font-mono text-[0.625rem] text-ink shadow-[var(--shadow-sm)] backdrop-blur">
          {orb.label}
        </span>
      </Link>
    </motion.div>
  );
}

export function GlobeHero() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [globeFrame, setGlobeFrame] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reduce) return;
    const move = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty("--mx", String((event.clientX - rect.left) / rect.width));
      stage.style.setProperty("--my", String((event.clientY - rect.top) / rect.height));
    };
    stage.addEventListener("pointermove", move, { passive: true });
    return () => stage.removeEventListener("pointermove", move);
  }, [reduce]);

  useEffect(() => {
    if (reduce) {
      setGlobeFrame(1);
      return;
    }

    const timer = window.setInterval(() => {
      setGlobeFrame((current) => (current + 1) % globeFrames.length);
    }, 720);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[34rem] [--mx:.5] [--my:.45]">
      <div className="absolute inset-[12%] rounded-full bg-white/40 blur-3xl" />
      <motion.div
        className="absolute left-1/2 top-[22%] z-20 size-[5.25rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={reduce ? undefined : { scale: [0.9, 1.16, 0.96, 1.08, 0.9], rotate: 360 }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <span className="absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.95),rgba(80,220,205,.42)_30%,rgba(168,84,47,.18)_52%,transparent_72%)] blur-md" />
        <span className="absolute -inset-5 rounded-full border border-white/50 shadow-[0_0_32px_rgba(90,235,215,.8),inset_0_0_22px_rgba(255,255,255,.9)]" />
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,white,rgba(62,211,198,.9),white,rgba(199,125,46,.75),white)] shadow-[0_0_30px_8px_rgba(255,255,255,.55)]" />
        <span className="absolute inset-[19%] rounded-full bg-white shadow-[0_0_18px_white]" />
      </motion.div>
      {projectOrbs.map((orb) => <ProjectOrb key={orb.label} orb={orb} reduce={reduce} />)}
      <motion.div
        className="absolute inset-[8%] rounded-full opacity-80"
        animate={reduce ? undefined : { y: [0, -9, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_calc(var(--mx)*100%)_calc(var(--my)*100%),rgba(255,255,255,.9),rgba(255,255,255,.42)_18%,rgba(255,255,255,.16)_54%,rgba(255,255,255,.04)_72%)] shadow-[inset_0_8px_36px_rgba(255,255,255,.65),inset_0_-28px_56px_rgba(70,80,60,.14),0_40px_70px_-34px_rgba(45,55,40,.48)] backdrop-blur-sm" />
        <motion.div
          className="absolute inset-[8%] overflow-hidden rounded-full"
          animate={reduce ? undefined : { rotate: [0, 1.2, 0, -1.2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          role="img"
          aria-label="Rotierende Strichweltkugel"
        >
          {globeFrames.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              priority={index < 2}
              sizes="(max-width: 768px) 82vw, 29rem"
              className={`object-contain mix-blend-multiply transition-opacity duration-500 ${
                index === globeFrame ? "opacity-75" : "opacity-0"
              }`}
            />
          ))}
        </motion.div>
        <motion.div
          className="absolute -inset-[10%] rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(46,125,123,.24),transparent,rgba(168,84,47,.18),transparent)] blur-xl"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      {[
        { label: "Claude", href: "/projects/abstractions", className: "left-[7%] top-[48%]" },
        { label: "Perplexity", href: "/projects/vision-check", className: "right-[6%] top-[58%]" },
      ].map((satellite, index) => (
        <motion.div
          className={`absolute z-10 ${satellite.className}`}
          animate={reduce ? undefined : { y: [0, index ? 8 : -8, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
          key={satellite.label}
        >
          <Link className="focus-ring flex flex-col items-center gap-2 no-underline" href={satellite.href}>
            <span className="relative flex items-center drop-shadow-lg">
              <span className="h-3 w-5 -skew-y-6 border border-white/50 bg-[#456cbb]" />
              <span className="mx-0.5 h-5 w-4 rounded-sm border border-white/80 bg-accent-tint" />
              <span className="h-3 w-5 skew-y-6 border border-white/50 bg-[#456cbb]" />
            </span>
            <span className="rounded-[var(--radius-pill)] bg-bg/75 px-2 py-0.5 font-mono text-[0.6875rem]">{satellite.label}</span>
          </Link>
        </motion.div>
      ))}
      <div className="absolute bottom-[3%] left-[18%] right-[18%] h-[7%] rounded-full bg-[radial-gradient(ellipse,rgba(26,30,22,.46),transparent_72%)] blur-md" />
    </div>
  );
}
