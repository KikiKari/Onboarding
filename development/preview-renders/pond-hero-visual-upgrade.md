# Brief 2: Visuelles Upgrade Pond-Hero

**Repository:** `/home/user/workspace/onboarding-repo` — bereits auf branch `pond-hero`, commit `937a942` gepusht  
**Ausgangspunkt:** Die R3F-Szene, State-Machine, Attribution, ProjectList — **funktioniert und bleibt strukturell wie sie ist**.

## Problem, das jetzt gelöst werden muss

Die aktuelle Pond-Szene sieht zu abstrakt aus. Sie erreicht nicht die fotorealistische Qualität der Nano-Banana-Varianten unter `/public/media/pond/concepts/variante-A.webp` bis `-D.webp`. Konkret:

1. **Der Teich wirkt wie ein Aquarium mit rechteckigem Ausschnitt in einem Wiesen-Foto** — nicht wie ein räumlich integrierter Teich in einer Naturlandschaft.
2. **Das Wasser ist grün-flach ohne Transparenz und ohne Blick in die Tiefe.**
3. **Die Seerosenblätter sind flache Rauten**, obwohl unter `/public/media/pond/blaetter/12130585.webp` bereits eine perfekt freigestellte Lotusblatt-Textur mit Clipping-Path liegt.
4. **Die Glaskugeln sind milchig-weiß, nicht transparent-refraktierend** — sie sollten aussehen wie in Variante D (großer transparenter Ball vorne links auf dem Blatt).
5. **Die Seerosenblüten sind als runde Foto-Cutouts über der Szene** eingesetzt, statt als echte 3D-Sprites mit Bokeh im Hintergrund integriert.

Screenshots zum Vergleich:
- **Aktueller Zustand:** `/home/user/workspace/pond-01-hero-idle.png`, `pond-06-distributed.png`, `pond-05-splash.png`
- **Zielästhetik:** `/public/media/pond/concepts/variante-D.webp` (Nahaufnahme), `variante-A.webp` (Übersicht), `variante-C.webp` (9 Kugeln)

## Was zu ändern ist

### 1. Wasser-Shader komplett neu

Aktuell wirkt es wie eine grüne PlaneMaterial mit leichter Sinus-Bewegung. Ersetze durch:

```glsl
// Fragment shader Auszug:
vec3 shallowColor = vec3(0.72, 0.75, 0.68);  // Ivory-Grün Oberfläche
vec3 deepColor    = vec3(0.15, 0.20, 0.18);  // Dunkles Moss-Sediment
vec3 sedimentColor = texture2D(uSedimentMap, worldUV).rgb;

float depthFactor = smoothstep(0.0, 1.0, vDepth);
vec3 waterColor = mix(shallowColor, deepColor * sedimentColor, depthFactor);

// Fresnel für Reflexion
float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
waterColor = mix(waterColor, envColor, fresnel * 0.6);

gl_FragColor = vec4(waterColor, 0.82);  // Alpha für Transparenz
```

- `uSedimentMap` = Textur aus `/media/pond/wasser/74753879.webp` (dunkles Wasser mit Ripples), leicht getönt
- Gerstner-Wellen: 3 Layer statt 2 (unterschiedliche Frequenz/Amplitude/Richtung, alle klein)
- Kaustik-Overlay: additive Sinus-basierte helle Streifen die den Boden „beleuchten"
- Am Rand: `smoothstep`-Fade zu weichem Ufer-Übergang (**kein harter Rechteck-Rand mehr**)

### 2. Teich-Form + Umgebung

- Der Teich soll **organisch geformt** sein (unregelmäßiges Oval), **nicht rechteckig ausgeschnitten**
- Rand: sanfter Alpha-Übergang, damit das Wasser nahtlos in die Umgebung fließt
- Umgebung: kein Fullscreen-Foto-Background mehr. Statt dessen: 
  - Boden-Plane mit `variante-A.webp` als Textur, in Perspektive (nicht floral-scharf, sondern soft-focus / DoF)
  - Der Teich sitzt darauf, integriert per Alpha-Blending
  - Optional: Am Teich-Rand kleine Grasbüschel-Sprites (aus vorhandenen Blüten-Bildern croppen)

### 3. Seerosenblätter mit echter Textur

Ändere `LilyPad`-Komponente in `components/site/pond/`:
- `PlaneGeometry(1.2, 1.2, 32, 32)` statt der aktuellen Raute
- Textur laden: `useTexture('/media/pond/blaetter/12130585.webp')` — das Blatt hat bereits einen Clipping-Path (weißer Hintergrund)
- Material: `<meshStandardMaterial map={texture} transparent alphaTest={0.5} side={THREE.DoubleSide} />`
- Zusätzlich: leichter Displacement in Y-Achse via Vertex-Shader (Sinus über `time` und `position.x/z`), damit die Blätter sanft im Wasser wiegen
- Zwei Textur-Varianten: `12130585.webp` (Standard) und `48178242.webp` (Grün auf weiß) — abwechselnd zuweisen für Vielfalt
- Rotation um Y leicht randomisiert je Blatt

### 4. Glaskugeln mit echter Refraktion

Das aktuelle `meshPhysicalMaterial` transmission funktioniert nur mit korrekter Environment-Map. Prüfe:
- `<Environment preset="park" background={false}>` ist gesetzt und wird gerendert
- Falls Refraktion trotzdem milchig-flat aussieht, verwende `MeshTransmissionMaterial` aus `@react-three/drei` statt `meshPhysicalMaterial`:
  ```tsx
  import { MeshTransmissionMaterial } from '@react-three/drei';
  <MeshTransmissionMaterial 
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
  ```
- `MeshTransmissionMaterial` ist deutlich überzeugender für Glaskugeln — kostet aber Performance. Bei 10 Kugeln (1 Master + 9 Projekte) sollte es noch laufen.

### 5. Blüten als Bokeh-Sprites im Hintergrund

Aktuell sind Blüten als runde `<Image>`-Cutouts vor der Szene. Umbauen:
- 5–7 `<Sprite>` mit Blüten-Textur aus `/media/pond/blueten/*.webp` (z.B. `78370994`, `70017289`, `72941882`)
- Position: hinter der Kamera-Ebene, `z > 5`
- `Sprite.material.opacity = 0.6`, `blending = THREE.AdditiveBlending`
- Skalierung 1.2–1.8 randomisiert
- Ein Post-Processing-Pass mit Depth of Field via `@react-three/postprocessing`:
  ```tsx
  <EffectComposer>
    <DepthOfField focusDistance={0.02} focalLength={0.05} bokehScale={4} />
    <Bloom intensity={0.4} luminanceThreshold={0.8} />
  </EffectComposer>
  ```
- Wichtig: `<Canvas dpr={[1, 1.5]}>` und `frameloop="demand"` prüfen, damit die Post-FX nicht die Bildrate zerstören

## Was NICHT geändert werden soll

- ✅ State Machine (idle → rolling → splashing → emerging → distributed → focused) — bleibt
- ✅ Master-Orb-Klick öffnet Projects-Repo — bleibt
- ✅ 9-Kugel-Klick öffnet Branch-URL — bleibt
- ✅ Framer-Motion-Vorschau-Card bei Hover — bleibt
- ✅ `<ProjectList>`-Komponente mit heller Sektion — bleibt komplett
- ✅ Footer-Attribution — bleibt
- ✅ `vercel.json` mit `installCommand: npm install` — bleibt
- ✅ `content.ts`, backend/, alle Routen — nicht anfassen

## Performance-Grenzen

- MeshTransmissionMaterial samples: max 4, resolution: max 512
- Post-FX aktivieren nur wenn `dpr <= 1.5` und `!reducedMotion`
- Auf mobile / low-end: fallback zu `meshPhysicalMaterial` ohne Post-FX
- Zielrahmenrate: 45 fps @ 1440p Desktop, 30 fps mobile

## Verifikation

1. `npm install` (falls neue Dependencies wie `@react-three/postprocessing` dazukommen)
2. `npm run dev` — Screenshots via Playwright bei localhost:3000:
   - Hero idle (Master-Orb sichtbar)
   - Hero distributed (9 Kugeln, keine Rechteck-Kante mehr sichtbar)
   - Hero focused (eine Kugel vergrößert mit Vorschau-Card)
   - Direkter Seiten-Vergleich als Composite-PNG: aktuell vs. neu vs. `variante-D.webp`
3. `npm run build` — muss grün bleiben, keine Bundle-Size-Regression über 50 kB
4. `git commit -m "refactor: fotorealistisches visuelles Upgrade Pond-Hero"`, `git push origin pond-hero`

## Wenn ein Aspekt technisch scheitert

Priorität in absteigender Reihenfolge:
1. Blatt-Texturen echte Fotos (kritisch — ohne das ist die Szene wertlos)
2. Glaskugeln transparent-refraktierend (kritisch)
3. Teich-Form organisch + Alpha-Übergang (wichtig)
4. Wasser-Shader mit Sediment-Tiefe (wichtig)
5. Bokeh-Post-FX (nice-to-have — kann weggelassen werden falls Performance nicht reicht)
