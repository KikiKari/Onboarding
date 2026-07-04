"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Photoreal pond water.
 *
 * - Sediment/ground texture sampled through the transparent surface for depth.
 * - Three small Gerstner-wave layers for a living, non-repetitive surface.
 * - Fresnel reflection blends an env-tint at grazing angles.
 * - Alpha 0.82 so the sediment shows through as real transparent water.
 * - Organic oval pond shape via a smoothstep alpha fade at the rim — no hard
 *   rectangular edge; the water dissolves softly into the shore.
 * - Additive caustic streaks lightly illuminate the sediment.
 */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uSplashCenter;
  uniform float uSplashTime;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;
  varying vec3 vNormal;

  float gerstner(vec2 pos, vec2 dir, float amp, float freq, float speed) {
    return amp * sin(dot(normalize(dir), pos) * freq + uTime * speed);
  }

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Three small Gerstner layers: differing frequency / amplitude / direction.
    float wave = 0.0;
    wave += gerstner(pos.xy, vec2(1.0, 0.35), 0.038, 2.0, 0.85);
    wave += gerstner(pos.xy, vec2(-0.4, 1.0), 0.026, 3.3, 1.30);
    wave += gerstner(pos.xy, vec2(0.8, -0.7), 0.018, 5.1, 1.85);

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

    // Approximate surface normal from wave slope for Fresnel.
    float eps = 0.15;
    float wx = gerstner(pos.xy + vec2(eps, 0.0), vec2(1.0, 0.35), 0.038, 2.0, 0.85)
             - gerstner(pos.xy - vec2(eps, 0.0), vec2(1.0, 0.35), 0.038, 2.0, 0.85);
    float wy = gerstner(pos.xy + vec2(0.0, eps), vec2(-0.4, 1.0), 0.026, 3.3, 1.30)
             - gerstner(pos.xy - vec2(0.0, eps), vec2(-0.4, 1.0), 0.026, 3.3, 1.30);
    vNormal = normalize(vec3(-wx, -wy, eps * 2.0));

    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorldPos = world.xyz;
    vViewDir = normalize(cameraPosition - world.xyz);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uEnv;
  uniform sampler2D uSedimentMap;
  varying vec2 vUv;
  varying float vElevation;
  varying vec3 vViewDir;
  varying vec3 vNormal;

  void main() {
    // Depth grows toward the pond centre: shallow rim -> deep mossy core.
    float radial = distance(vUv, vec2(0.5)) * 2.0;
    float depthFactor = smoothstep(0.0, 1.0, 1.0 - clamp(radial, 0.0, 1.0));

    // Sediment sampled and tinted; scrolls very slowly for life.
    vec2 sedUv = vUv * 1.6 + vec2(uTime * 0.004, uTime * 0.006);
    vec3 sediment = texture2D(uSedimentMap, sedUv).rgb;
    sediment = mix(sediment, uDeep, 0.55);

    // Deep mossy sediment shows strongly in the centre; muted teal-grey at rim.
    vec3 deepBed = uDeep * (0.5 + sediment);
    vec3 waterColor = mix(uShallow, deepBed, depthFactor);

    // Additive caustic streaks that "light" the sediment (kept subtle).
    float caustic = sin(vUv.x * 40.0 + uTime * 1.2) * sin(vUv.y * 36.0 - uTime * 0.9);
    caustic = pow(max(caustic, 0.0), 3.0);
    waterColor += caustic * 0.035 * (1.0 - depthFactor * 0.5);

    // Fresnel reflection: env tint at grazing angles.
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);
    waterColor = mix(waterColor, uEnv, fresnel * 0.45);

    // Wave-crest highlight (subtle so bloom doesn't blow it out).
    float highlight = smoothstep(0.03, 0.08, vElevation);
    waterColor += highlight * 0.06;

    // Organic oval rim: irregular boundary + soft alpha fade (no rectangle).
    vec2 c = vUv - 0.5;
    float ang = atan(c.y, c.x);
    // Wobble the pond radius per angle for an irregular natural oval.
    float wobble = 0.03 * sin(ang * 3.0) + 0.02 * sin(ang * 5.0 + 1.3);
    // Elliptical distance (slightly wider than tall).
    float er = length(vec2(c.x / 0.52, c.y / 0.46));
    float edge = 1.0 - smoothstep(0.82 + wobble, 1.0 + wobble, er);

    float alpha = 0.82 * edge + highlight * 0.1 * edge;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(waterColor, alpha);
  }
`;

export function Water({
  splashRef,
}: {
  splashRef: React.MutableRefObject<{ x: number; y: number; t: number } | null>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const sediment = useTexture("/media/pond/wasser/74753879.webp");
  sediment.wrapS = sediment.wrapT = THREE.RepeatWrapping;
  sediment.colorSpace = THREE.SRGBColorSpace;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSplashCenter: { value: new THREE.Vector2(0, 0) },
      uSplashTime: { value: 0 },
      uDeep: { value: new THREE.Color(0.12, 0.17, 0.15) },
      uShallow: { value: new THREE.Color(0.55, 0.61, 0.57) },
      uEnv: { value: new THREE.Color(0.78, 0.82, 0.85) },
      uSedimentMap: { value: sediment },
    }),
    [sediment],
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
      <planeGeometry args={[13, 12, 128, 128]} />
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
