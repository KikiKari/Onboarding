"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Transparent pond water with two Gerstner-wave layers and a radial splash
 * ripple driven by uniforms. Alpha ~0.72 so the sediment ground shows through.
 */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uSplashCenter;
  uniform float uSplashTime;
  varying vec2 vUv;
  varying float vElevation;

  // A single Gerstner-style wave layer.
  float gerstner(vec2 pos, vec2 dir, float amp, float freq, float speed) {
    return amp * sin(dot(normalize(dir), pos) * freq + uTime * speed);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    float wave = 0.0;
    wave += gerstner(pos.xy, vec2(1.0, 0.35), 0.045, 2.1, 0.9);
    wave += gerstner(pos.xy, vec2(-0.4, 1.0), 0.030, 3.4, 1.35);

    // Radial splash ripple emanating from uSplashCenter.
    float st = uTime - uSplashTime;
    if (uSplashTime > 0.0 && st > 0.0 && st < 2.4) {
      float dist = distance(pos.xy, uSplashCenter);
      float ring = st * 3.0;
      float band = exp(-pow((dist - ring) * 3.0, 2.0));
      float decay = 1.0 - clamp(st / 2.4, 0.0, 1.0);
      wave += sin(dist * 14.0 - st * 12.0) * band * decay * 0.22;
    }

    pos.z += wave;
    vElevation = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uSediment;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    // Distance from centre gives a soft radial depth toward the pond middle.
    float radial = distance(vUv, vec2(0.5));
    // Faux sediment ground: mossy gradient sampled procedurally.
    float ground = smoothstep(0.15, 0.62, radial);
    vec3 sediment = mix(uSediment, uDeep, ground);

    // Surface tint reacting to wave elevation for subtle highlights.
    vec3 surface = mix(uShallow, uDeep, clamp(radial * 1.4, 0.0, 1.0));
    float highlight = smoothstep(0.02, 0.08, vElevation);

    vec3 color = mix(sediment, surface, 0.55);
    color += highlight * 0.16;

    float alpha = 0.72 + highlight * 0.12;
    gl_FragColor = vec4(color, alpha);
  }
`;

export type WaterHandle = {
  triggerSplash: (x: number, y: number, time: number) => void;
};

export function Water({ splashRef }: { splashRef: React.MutableRefObject<{ x: number; y: number; t: number } | null> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSplashCenter: { value: new THREE.Vector2(0, 0) },
      uSplashTime: { value: 0 },
      uDeep: { value: new THREE.Color("#3c5142") },
      uShallow: { value: new THREE.Color("#c9d3c2") },
      uSediment: { value: new THREE.Color("#4a5f43") },
    }),
    [],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const t = state.clock.getElapsedTime();
    matRef.current.uniforms.uTime.value = t;
    const pending = splashRef.current;
    if (pending) {
      matRef.current.uniforms.uSplashCenter.value.set(pending.x, pending.y);
      matRef.current.uniforms.uSplashTime.value = pending.t;
      splashRef.current = null;
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[14, 14, 96, 96]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
