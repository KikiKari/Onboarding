"use client";

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
};

/**
 * A luminous glass sphere using transmission-based physical material.
 * Springs up + scales on hover. Emerge animation lifts it from the water.
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
}: GlassOrbProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const target = useRef({ scale: 1, lift: 0 });

  useFrame((_, delta) => {
    if (!group.current) return;
    const wantScale = (hovered || focused ? 1.14 : 1) * emergeProgress;
    const wantLift = hovered || focused ? 0.12 : 0;
    // Simple critically-damped follow toward targets.
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
      </mesh>
      {/* Tinted inner ring hints the project accent color. */}
      <mesh scale={0.82}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.14 * emergeProgress} />
      </mesh>
    </group>
  );
}
