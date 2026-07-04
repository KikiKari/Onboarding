"use client";

import { Environment, MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { projects } from "@/content";
import { Blossoms } from "./blossoms";
import { GlassOrb } from "./glass-orb";
import type { PadLayout } from "./lily-pads";
import { LilyPads } from "./lily-pads";
import { Splash } from "./splash";
import type { Phase } from "./types";
import { Water } from "./water";

const ACCENT_HEX: Record<string, string> = {
  accent: "#a8542f",
  teal: "#2e7d7b",
  amber: "#c77d2e",
};

// Master orb resting spot on the left "shore", and the splash impact point.
// Master-Orb Ruheposition: näher zur Mitte damit er in allen Viewport-Größen
// sichtbar bleibt (auch bei schmalen mobilen Ansichten).
const MASTER_REST: [number, number, number] = [-2.2, 0.42, 1.9];
const SPLASH_POINT: [number, number, number] = [0, 0.18, 0.4];

/** Nine pads in a circle: 12 o'clock start, clockwise. */
export function buildLayout(): PadLayout[] {
  const R = 2.7;
  return projects.map((p, i) => {
    const angle = (i / projects.length) * Math.PI * 2; // 0 = top
    // Clockwise from 12 o'clock: x = sin, z = -cos
    const x = Math.sin(angle) * R;
    const z = -Math.cos(angle) * R;
    return {
      slug: p.slug,
      angle,
      radius: R,
      position: [x, 0.03, z] as [number, number, number],
      scale: 1.15 + (i % 3) * 0.08,
    };
  });
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Soft-focus ground bed beneath the pond so the water reads as integrated
 *  into a natural setting rather than a rectangular cutout. */
function GroundBed() {
  const tex = useTexture("/media/pond/concepts/variante-A.webp");
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
      <planeGeometry args={[26, 22]} />
      {/* Darkened + mossy-tinted so the water above reads as deep, not pale.
          The bright ivory of variante-A would otherwise wash through the
          transparent surface. */}
      <meshBasicMaterial map={tex} color="#5a6a52" toneMapped={false} />
    </mesh>
  );
}

export function PondScene({
  phase,
  focusedProject,
  setFocusedProject,
  onMasterHover,
  onMasterClick,
  onProjectClick,
  onSplashDone,
  reduce,
  highQuality,
}: {
  phase: Phase;
  focusedProject: string | null;
  setFocusedProject: (id: string | null) => void;
  onMasterHover: () => void;
  onMasterClick: () => void;
  onProjectClick: (slug: string) => void;
  onSplashDone: () => void;
  reduce: boolean;
  highQuality: boolean;
}) {
  const layout = useMemo(() => buildLayout(), []);
  const splashRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const { clock } = useThree();
  const rollT = useRef(0);
  const masterPos = useRef(new THREE.Vector3(...MASTER_REST));
  const splashFired = useRef(false);

  // Drive the master orb rolling toward the water during the "rolling" phase.
  useFrame((_, delta) => {
    if (phase === "rolling") {
      rollT.current = Math.min(1, rollT.current + delta / 1.2);
      const t = easeInOut(rollT.current);
      masterPos.current.lerpVectors(
        new THREE.Vector3(...MASTER_REST),
        new THREE.Vector3(...SPLASH_POINT),
        t,
      );
    } else if (phase === "idle") {
      rollT.current = 0;
      masterPos.current.set(...MASTER_REST);
      splashFired.current = false;
    }

    if (phase === "splashing" && !splashFired.current) {
      splashFired.current = true;
      splashRef.current = { x: SPLASH_POINT[0], y: SPLASH_POINT[2], t: clock.getElapsedTime() };
    }
  });

  const orbsVisible = phase === "distributed" || phase === "focused" || phase === "emerging";
  const masterVisible = phase === "idle" || phase === "rolling";

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={null}>
        <Environment preset="park" />
        <GroundBed />
        <Blossoms />
        <Water splashRef={splashRef} />
        <LilyPads layout={layout} />

        {/* Master orb (idle/rolling). */}
        {masterVisible && (
          <MasterOrb
            posRef={masterPos}
            onHover={onMasterHover}
            onClick={onMasterClick}
            reduce={reduce}
            highQuality={highQuality}
          />
        )}

        {/* Splash droplets. */}
        <Splash active={phase === "splashing" || phase === "emerging"} origin={SPLASH_POINT} onDone={onSplashDone} />

        {/* Project orbs distributed on pads. */}
        {orbsVisible &&
          layout.map((pad, i) => {
            const project = projects[i];
            const emerge = phase === "emerging" ? 0.55 : 1;
            const focused = focusedProject === project.slug;
            // Focused orb rolls slightly toward the camera / foreground.
            const basePos: [number, number, number] = [
              pad.position[0],
              pad.position[1] + 0.35,
              pad.position[2],
            ];
            const focusPos: [number, number, number] = focused
              ? [pad.position[0] * 0.72, pad.position[1] + 0.42, pad.position[2] * 0.72 + 0.9]
              : basePos;
            return (
              <GlassOrb
                key={project.slug}
                position={focusPos}
                radius={0.3}
                focused={focused}
                visible
                emergeProgress={emerge}
                accentColor={ACCENT_HEX[project.accent] ?? "#ffffff"}
                highQuality={highQuality}
                onPointerOver={() => setFocusedProject(project.slug)}
                onPointerOut={() => setFocusedProject(null)}
                onClick={() => onProjectClick(project.slug)}
              />
            );
          })}
      </Suspense>
    </>
  );
}

function MasterOrb({
  posRef,
  onHover,
  onClick,
  reduce,
  highQuality,
}: {
  posRef: React.MutableRefObject<THREE.Vector3>;
  onHover: () => void;
  onClick: () => void;
  reduce: boolean;
  highQuality: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.copy(posRef.current);
    if (!reduce) {
      group.current.position.y += Math.sin(state.clock.getElapsedTime() * 1.4) * 0.02;
      group.current.rotation.y += 0.006;
    }
  });
  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "auto")}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.42, 64, 64]} />
        {highQuality ? (
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.4}
            roughness={0}
            ior={1.5}
            chromaticAberration={0.06}
            distortion={0.1}
            temporalDistortion={0.1}
            backside
            samples={4}
            resolution={512}
          />
        ) : (
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.04}
            ior={1.5}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.8}
            color="white"
          />
        )}
      </mesh>
      {/* Luminous halo. */}
      <mesh scale={1.35}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshBasicMaterial color="#dfeef0" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
