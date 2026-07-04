"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type PadLayout = {
  slug: string;
  angle: number; // radians, 12 o'clock start, clockwise
  radius: number;
  position: [number, number, number];
  scale: number;
};

/**
 * Nine free-drifting lily pads arranged in a circle around the pond centre.
 * Rendered as slightly domed, alpha-clipped planes with a subtle Y drift.
 */
export function LilyPads({ layout }: { layout: PadLayout[] }) {
  const texture = useTexture("/media/pond/blaetter/12130585.webp");
  texture.colorSpace = THREE.SRGBColorSpace;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 24, 24);
    const pos = geo.attributes.position;
    // Gentle dome so pads read as three-dimensional lily leaves.
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const d = Math.sqrt(x * x + y * y);
      pos.setZ(i, Math.cos(d * Math.PI) * 0.06);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(() => layout.map((_, i) => i * 1.7), [layout]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      child.rotation.z = Math.sin(t * 0.15 + seeds[i]) * 0.08;
      child.position.y = 0.02 + Math.sin(t * 0.6 + seeds[i]) * 0.015;
    });
  });

  return (
    <group ref={group}>
      {layout.map((pad) => (
        <mesh
          key={pad.slug}
          geometry={geometry}
          position={pad.position}
          rotation={[-Math.PI / 2, 0, pad.angle]}
          scale={pad.scale}
          receiveShadow
        >
          <meshStandardMaterial
            map={texture}
            transparent
            alphaTest={0.35}
            side={THREE.DoubleSide}
            roughness={0.72}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}
