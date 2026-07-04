"use client";

import { Billboard } from "@react-three/drei";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const BLOSSOMS = [
  { src: "/media/pond/blueten/70017289.webp", position: [-5.4, 1.4, -5.2], scale: 1.9, opacity: 0.5 },
  { src: "/media/pond/blueten/72941882.webp", position: [5.0, 1.2, -5.6], scale: 1.7, opacity: 0.42 },
  { src: "/media/pond/blueten/73918478.webp", position: [-2.6, 1.0, -6.0], scale: 1.4, opacity: 0.36 },
  { src: "/media/pond/blueten/72942327.webp", position: [2.2, 1.1, -5.8], scale: 1.5, opacity: 0.4 },
] as const;

/**
 * Soft, camera-facing lotus blossoms in the far background. Depth places them
 * behind the interactive orbs; the environment blur softens them naturally.
 */
export function Blossoms() {
  const textures = useTexture(BLOSSOMS.map((b) => b.src));
  textures.forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));

  return (
    <group>
      {BLOSSOMS.map((b, i) => (
        <Billboard key={b.src} position={b.position as unknown as [number, number, number]}>
          <mesh scale={b.scale}>
            <circleGeometry args={[0.5, 32]} />
            <meshBasicMaterial
              map={textures[i]}
              transparent
              opacity={b.opacity}
              depthWrite={false}
            />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
}
