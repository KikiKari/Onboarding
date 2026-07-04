"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 80;

/**
 * A one-shot water-droplet burst. When `active` flips on, particles get radial
 * initial velocities and fall back under gravity. Simulated in useFrame.
 */
export function Splash({
  active,
  origin,
  onDone,
}: {
  active: boolean;
  origin: [number, number, number];
  onDone?: () => void;
}) {
  const points = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(COUNT * 3));
  const elapsed = useRef(0);
  const started = useRef(false);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;

    if (active && !started.current) {
      started.current = true;
      elapsed.current = 0;
      for (let i = 0; i < COUNT; i += 1) {
        pos.setXYZ(i, origin[0], origin[1], origin[2]);
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.6 + Math.random() * 1.4;
        const up = 1.6 + Math.random() * 1.8;
        velocities.current[i * 3] = Math.cos(angle) * speed;
        velocities.current[i * 3 + 1] = up;
        velocities.current[i * 3 + 2] = Math.sin(angle) * speed;
      }
      pos.needsUpdate = true;
      points.current.visible = true;
    }

    if (!active) {
      started.current = false;
      points.current.visible = false;
      return;
    }

    elapsed.current += delta;
    for (let i = 0; i < COUNT; i += 1) {
      velocities.current[i * 3 + 1] -= 6.5 * delta; // gravity
      pos.setX(i, pos.getX(i) + velocities.current[i * 3] * delta);
      pos.setY(i, Math.max(origin[1], pos.getY(i) + velocities.current[i * 3 + 1] * delta));
      pos.setZ(i, pos.getZ(i) + velocities.current[i * 3 + 2] * delta);
    }
    pos.needsUpdate = true;

    if (elapsed.current > 1.1) {
      points.current.visible = false;
      onDone?.();
    }
  });

  return (
    <points ref={points} geometry={geometry} visible={false}>
      <pointsMaterial
        size={0.07}
        color="#eaf3f2"
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
