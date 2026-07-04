"use client";

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const SPRITES = [
  { tex: 0, position: [-6.0, 0.9, -6.2], scale: 1.7, opacity: 0.5 },
  { tex: 1, position: [5.8, 0.7, -6.6], scale: 1.5, opacity: 0.44 },
  { tex: 0, position: [-3.0, 0.5, -7.0], scale: 1.3, opacity: 0.38 },
  { tex: 1, position: [3.4, 0.6, -6.8], scale: 1.4, opacity: 0.4 },
  { tex: 0, position: [-5.0, 1.6, -7.6], scale: 1.6, opacity: 0.34 },
  { tex: 1, position: [5.2, 1.7, -7.4], scale: 1.35, opacity: 0.32 },
] as const;

/**
 * Soft, additively-blended lotus blossoms rendered as true 3D sprites well
 * behind the interactive layer (z far negative). With DoF post-processing on,
 * they melt into warm bokeh; without it, the low opacity + additive blend keeps
 * them as gentle background glow. Depth-write is off so they never occlude the
 * orbs or water.
 */
export function Blossoms() {
  const [a, b] = useTexture([
    "/media/pond/processed/blossom-a.png",
    "/media/pond/processed/blossom-b.png",
  ]);
  a.colorSpace = THREE.SRGBColorSpace;
  b.colorSpace = THREE.SRGBColorSpace;

  const materials = useMemo(
    () =>
      [a, b].map(
        (map) =>
          new THREE.SpriteMaterial({
            map,
            transparent: true,
            opacity: 0.5,
            // Normal blending: the blossom cutouts are near-white, so additive
            // blending blows them out to hard white blooms. Soft alpha reads as
            // gentle background flowers that melt into DoF bokeh.
            blending: THREE.NormalBlending,
            depthWrite: false,
            depthTest: true,
          }),
      ),
    [a, b],
  );

  return (
    <group>
      {SPRITES.map((s, i) => (
        <sprite
          key={i}
          position={s.position as unknown as [number, number, number]}
          scale={[s.scale, s.scale, s.scale]}
          material={(() => {
            const m = materials[s.tex].clone();
            m.opacity = s.opacity;
            return m;
          })()}
        />
      ))}
    </group>
  );
}
