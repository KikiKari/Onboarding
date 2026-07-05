"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { projects } from "@/content";

const ACCENT_VAR: Record<string, string> = {
  accent: "var(--accent)",
  teal: "var(--accent-2)",
  amber: "var(--accent-3)",
};

const PLATFORM_TINT: Record<string, string> = {
  Claude: "var(--accent)",
  Perplexity: "var(--accent-2)",
};

/**
 * Light project index: numbered rows with a connecting line and a marker orb
 * that glides toward the "open" link on hover — echoing the pond's glass orbs.
 */
export function ProjectList() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative">
      <ul className="m-0 list-none divide-y divide-[var(--line)] p-0">
        {projects.map((project, i) => {
          const accent = ACCENT_VAR[project.accent] ?? "var(--accent)";
          const isHover = hovered === project.slug;
          return (
            <li key={project.slug}>
              <Link
                href={`/projects/${project.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 no-underline sm:gap-6"
                onMouseEnter={() => setHovered(project.slug)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(project.slug)}
                onBlur={() => setHovered(null)}
              >
                {/* Numbered circle. */}
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border font-mono text-sm transition-colors duration-[var(--motion-base)]"
                  style={{
                    borderColor: isHover ? accent : "var(--line-strong)",
                    color: isHover ? accent : "var(--muted)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Title + platform badge + connecting line + marker orb. */}
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="flex flex-wrap items-center gap-2.5">
                    <span
                      className="display truncate text-lg transition-colors duration-[var(--motion-base)] sm:text-xl"
                      style={{ color: isHover ? accent : "var(--ink)" }}
                    >
                      {project.title}
                    </span>
                    <span
                      className="eyebrow rounded-[var(--radius-pill)] px-2 py-0.5 text-[0.625rem] text-white"
                      style={{ background: PLATFORM_TINT[project.platform] }}
                    >
                      {project.platform}
                    </span>
                  </span>
                  {/* Connecting line with the gliding marker orb (schwarze Glaskugel). */}
                  <span className="relative hidden h-6 items-center sm:flex">
                    <span
                      className="h-px w-full"
                      style={{ background: "var(--line)" }}
                    />
                    <motion.span
                      aria-hidden="true"
                      className="absolute top-1/2 size-6 -translate-y-1/2"
                      style={{ left: 0 }}
                      initial={false}
                      animate={{ left: isHover ? "100%" : "0%", x: isHover ? "-100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                    >
                      <Image
                        src="/media/hero-v2/markers/orb-marker-black.png"
                        alt=""
                        width={24}
                        height={24}
                        className="h-full w-full object-contain"
                      />
                    </motion.span>
                  </span>
                </span>

                {/* Open link. */}
                <span
                  className="shrink-0 font-mono text-xs transition-colors duration-[var(--motion-base)]"
                  style={{ color: isHover ? accent : "var(--muted)" }}
                >
                  Öffnen →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
