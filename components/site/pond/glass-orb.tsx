"use client";

import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

type GlassOrbProps = {
  position: [number, number, number];
  radius?: number;
  active?: boolean;
  focused?: boolean;
  visible?: boolean;
  emergeProgress?: number; // 0..1 for emergence animation
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
  accentColor?: string;
  /** High-quality transmission on capable devices; physical-material fallback otherwise. */
  highQuality?: boolean;
};

/**
 * A transparent, refracting glass sphere. On capable devices it uses
 * MeshTransmissionMaterial for real chromatic-aberration refraction (like the
 * concept renders); on low-end / reduced-motion it falls back to a lighter
 * meshPhysicalMaterial. Springs up + scales on hover; emerge lifts it from
 * the water.
 */
export function GlassOrb({
  position,
  radius = 0.3,
  focused = false,
  visible = true,
  emergeProgress = 1,
  onPointerOver,
  onPointerOut,
  onClick,
  accentColor = "#ffffff",
  highQuality = true,
}: GlassOrbProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const target = useRef({ scale: 1, lift: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const wantScale = (hovered || focused ? 1.14 : 1) * emergeProgress;
    const wantLift = hovered || focused ? 0.12 : 0;
    const k = 1 - Math.pow(0.001, delta);
    target.current.scale += (wantScale - target.current.scale) * k;
    target.current.lift += (wantLift - target.current.lift) * k;
    group.current.scale.setScalar(Math.max(0.0001, target.current.scale));
    group.current.position.set(position[0], position[1] + target.current.lift, position[2]);
    group.current.rotation.y += delta * 0.4;
  });

  if (!visible) return null;

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onPointerOver?.();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        onPointerOut?.();
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <mesh castShadow>
        <sphereGeometry args={[radius, 48, 48]} />
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
            transparent
            opacity={emergeProgress}
          />
        ) : (
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.5}
            roughness={0.05}
            ior={1.5}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={1.5}
            color="white"
            transparent
            opacity={emergeProgress}
          />
        )}
      </mesh>
      {/* Faint accent tint hints the project colour without clouding the glass. */}
      <mesh scale={0.86}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.08 * emergeProgress} />
      </mesh>
    </group>
  );
}
