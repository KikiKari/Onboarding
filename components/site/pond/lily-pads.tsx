"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
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
 * Photoreal lily pads: alpha-clipped photographic leaf textures on a high-res
 * PlaneGeometry (32x32) whose vertices gently sway with the water. Two texture
 * variants alternate for visual variety, and each pad gets a randomised yaw.
 *
 * The leaf textures are pre-keyed to RGBA in /media/pond/processed/ so the real
 * lotus silhouette drives the alphaTest clip (the source webps ship on solid
 * backgrounds, so alphaTest alone would show a rectangle).
 */

// Sway is applied per-mesh in the vertex program via onBeforeCompile so each
// pad can carry an independent phase without a full custom ShaderMaterial
// (keeps map/alphaTest/lighting from meshStandardMaterial intact).
function makeLeafMaterial(texture: THREE.Texture, phase: number) {
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 0.62,
    metalness: 0,
  });
  mat.userData.uTime = { value: 0 };
  mat.userData.uPhase = { value: phase };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = mat.userData.uTime;
    shader.uniforms.uPhase = mat.userData.uPhase;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform float uTime;
         uniform float uPhase;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         // Local plane is in XY (rotated to lie flat). Wobble along local Z
         // (world Y) using a travelling sine over the leaf surface.
         float w = sin(position.x * 2.4 + uTime * 1.1 + uPhase)
                 * cos(position.y * 2.1 + uTime * 0.9 + uPhase);
         transformed.z += w * 0.05;`,
      );
  };
  return mat;
}

export function LilyPads({ layout }: { layout: PadLayout[] }) {
  const [leafA, leafB] = useTexture([
    "/media/pond/processed/leaf-a.png",
    "/media/pond/processed/leaf-b.png",
  ]);
  leafA.colorSpace = THREE.SRGBColorSpace;
  leafB.colorSpace = THREE.SRGBColorSpace;
  leafA.anisotropy = 8;
  leafB.anisotropy = 8;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1.2, 1.2, 32, 32);
    return geo;
  }, []);

  // Alternate textures + per-pad randomised yaw and phase.
  const specs = useMemo(
    () =>
      layout.map((pad, i) => ({
        material: makeLeafMaterial(i % 2 === 0 ? leafA : leafB, i * 1.37),
        yaw: (Math.sin(i * 12.9898) * 0.5 + 0.5) * Math.PI * 2,
      })),
    [layout, leafA, leafB],
  );

  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(() => layout.map((_, i) => i * 1.7), [layout]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Drive per-material displacement time + a gentle bob/tilt of the whole pad.
    specs.forEach((s) => {
      s.material.userData.uTime.value = t;
    });
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      child.position.y = 0.015 + Math.sin(t * 0.5 + seeds[i]) * 0.012;
    });
  });

  return (
    <group ref={group}>
      {layout.map((pad, i) => (
        <mesh
          key={pad.slug}
          geometry={geometry}
          material={specs[i].material}
          position={pad.position}
          rotation={[-Math.PI / 2, 0, specs[i].yaw]}
          scale={pad.scale}
          receiveShadow
        />
      ))}
    </group>
  );
}
