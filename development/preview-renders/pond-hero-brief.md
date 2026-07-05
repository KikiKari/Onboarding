# Brief: 3D-Teich-Hero + statische Projektliste

**Repository:** `/home/user/workspace/onboarding-repo` (branch `pond-hero`, bereits ausgecheckt)  
**Stack:** Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion 12  
**Zusätzlich zu installieren:** `three`, `@react-three/fiber`, `@react-three/drei`, `leva` (optional für Debug)

## Ziel

Ersetze die bestehende `components/site/globe-hero.tsx` durch eine neue Komponente `components/site/pond-hero.tsx` mit interaktivem 3D-Teich. Ändere zusätzlich die Projekt-Sektion in `app/page.tsx` von dunklem zu hellem Hintergrund mit Marker-Kugel-Hover-Animation nach dem Vorbild der beigefügten Screenshots.

## Interaktions-Story (verbindlich)

### Hero-Bereich (100vh, oberer Landing-Bereich)

**Startzustand:** Kamera schwebt leicht schräg über einem transparenten, natürlichen Teich. Links im Frame ruht auf einer natürlichen Umgebung (Steinkante, Blatt oder Uferkiesel) EINE einzelne luminöse Glaskugel — der "Master Orb". Der Teich ist transparent genug, um in die Wassertiefe blicken zu lassen. Leichte kontinuierliche Wellen und Seerosenbewegung. Der Vordergrund ist plastisch und cinematisch (nach Vorbild "Variante D"), der Hintergrund weich (nach "Variante A/B/C"): weiche Ivory-Tiefe, verschwommene Seerosenblüten.

**Interaktion 1 – Hover auf Master Orb:**  
Der Orb rollt sanft in Richtung Wasser (wie in Variante A), erreicht die Wasseroberfläche und erzeugt einen dramatischen Kronen-Splash (wie in Variante D). Das ist der "GitHub Repo Main"-Link — Klick öffnet `https://github.com/KikiKari/Projects` in neuem Tab.

**Interaktion 2 – Nach Splash:**  
Aus dem Splash tauchen 9 neue Glaskugeln aus dem Wasser auf (Emergenz-Animation: Blase → Kugel steigt → Wassertropfen fallen zurück). Sie verteilen sich fließend auf 9 frei schwebende grüne Seerosenblätter im Teich in kreisförmiger Anordnung um das Zentrum. Jede Kugel repräsentiert ein Projekt.

**Interaktion 3 – Hover auf Projektkugel:**  
Die entsprechende Kugel rollt sanft auf ihr Seerosenblatt in den Vordergrund. Über der Kugel erscheint eine Framer-Motion-Card mit: Titel, Platform-Badge (Claude/Perplexity), Kurzbeschreibung, Tags. Kein Wasser-Splash mehr — nur die Rollbewegung.

**Interaktion 4 – Klick auf Projektkugel:**  
Öffnet `https://github.com/KikiKari/Projects/tree/{branch}` in neuem Tab. Die 9 Branches sind in `content.ts` unter `projects` gepflegt (Feld `github`). Verwende die dort hinterlegte URL direkt.

### Statische Projekt-Sektion (nach Scroll, unter Hero)

Ersetze in `app/page.tsx` die bestehende Section `id="projekte"` mit dunklem Background durch eine **helle Version** (Ivory `#FAF8F4`), die dem Screenshot-Vorbild folgt:

- 9 nummerierte Zeilen (01–09), jede mit: Nummer-Kreis links, Titel + Platform-Badge, horizontale Verbindungslinie zur Mitte, kleine Marker-Kugel auf der Linie, "Öffnen →"-Link rechts
- **Hover-Effekt:** Beim Hover auf eine Zeile bewegt sich die Marker-Kugel entlang der Linie nach rechts zum "Öffnen"-Link (Framer Motion `x`-Transform, ~600ms cubic-bezier)
- Farben passend zum Design-System (`content.ts` liefert `accent`-Feld je Projekt: `accent | teal | amber`)
- Optional rechts eine kleine dekorative Glasschale-Illustration (die vorhandenen `element_02_beads_group.png` / `element_01_glass_bowl.png` in `design-reference/examples/` bieten sich als Referenz)

## Verbindliche Design-Tokens (aus `design-reference/Produkt Landingpage.dc.html`)

```css
--bg: #FAF8F4;
--surface: #FFFFFF;
--surface-2: #F1EEE7;
--ink: #1B1A17;
--muted: #6E6A61;
--line: #E5E1D8;
--accent: #A8542F;      /* Copper */
--accent-2: #2E7D7B;    /* Teal */
--accent-3: #C77D2E;    /* Amber */
--font-display: 'Newsreader', Georgia, serif;
--font-sans: 'Hanken Grotesk', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

Diese sind bereits in `app/globals.css` definiert — nicht neu erfinden, sondern verwenden.

## R3F-Szene: Technische Vorgaben

**Beleuchtung:**
- HDRI: `useEnvironment` mit `preset="park"` oder eigene HDRI aus `/media/hdri/` (habe ich noch nicht ins Repo kopiert — bei Bedarf per `useEnvironment` mit Drei-Preset arbeiten)
- Directional light 3D-Position (5, 5, 5), soft shadows

**Wasser-Shader:**
- `THREE.ShaderMaterial` mit custom vertex/fragment shader
- Gerstner-Wellen (2–3 Layer, unterschiedliche Amplitude/Frequenz/Richtung)
- Refraktion durch Sample der darunter liegenden Sediment-Textur
- Alpha ~0.75 für Transparenz, damit Kieselgrund durchscheint
- Sediment: dunkles Moss-Grün Verlauf oder Textur aus `/media/pond/wasser/74754135.webp`
- Ripple-Pulse beim Splash: Radial dispatchete Welle vom Splash-Punkt

**Seerosenblätter:**
- 9 Blätter als leicht gewölbte `PlaneGeometry` (subdivided ~32×32) mit Textur aus `/media/pond/blaetter/12130585.webp` (hat sauberen Clipping-Path)
- Alpha-Freistellung via `alphaTest` und `THREE.DoubleSide`
- Leichte Sinus-Vertex-Displacement für Wellenbewegung
- Free-drift: kleine kontinuierliche Rotation um Y

**Seerosenblüten (Deko im Hintergrund):**
- 3–5 Sprites mit Textur aus `/media/pond/blueten/*.webp`
- `AlwaysFaceCamera` (Sprite oder Billboard), leichter Bloom-Post-Effect
- Depth of Field: hintere sind blurred, vordere schärfer

**Glaskugeln:**
```tsx
<meshPhysicalMaterial
  transmission={1}
  thickness={0.5}
  roughness={0.05}
  ior={1.5}
  chromaticAberration={0.03}
  envMapIntensity={1.5}
  color="white"
/>
```
- Radius ~0.3 units, position auf Blatt-Y + 0.35
- Bei Hover: `useSpring` skaliert auf 1.1, position.y hebt 0.1

**Splash-Animation:**
- Beim Master-Orb-Splash: `Points` mit 60–100 Wassertropfen-Partikeln, Physik simuliert per `useFrame` (Gravity + Initial Velocity radial)
- Radial-Welle im Water-Shader (Uniform `uSplashCenter`, `uSplashTime`)
- Sound optional: `<audio>` mit kurzem Wasser-Splash-Sample (falls in `/public/audio/` vorhanden — sonst weglassen)

**State Machine:**

```typescript
type Phase = "idle" | "rolling" | "splashing" | "emerging" | "distributed" | "focused"
type ProjectId = string | null
const [phase, setPhase] = useState<Phase>("idle")
const [focusedProject, setFocusedProject] = useState<ProjectId>(null)
```

Übergänge:
- `idle` + hover master → `rolling` (1.2s)
- `rolling` end → `splashing` (0.8s)
- `splashing` end → `emerging` (1.5s)
- `emerging` end → `distributed`
- `distributed` + hover project X → `focused` mit `focusedProject=X`
- `focused` + mouseleave → `distributed`
- `distributed` + click empty water → zurück zu `idle` (optional reset)

Bei prefers-reduced-motion: Skip Animationen, direkt `distributed`-Phase zeigen.

## Datenquelle für die 9 Projekte

Aus `content.ts` (bereits vorhanden):
```typescript
import { projects } from "@/content";
// projects ist Array von 9 Objekten mit: slug, title, platform, summary, detail, tags, github, accent
```

Reihenfolge im Kreis: nimm sie so wie sie im Array stehen, um 12-Uhr-Position starten, im Uhrzeigersinn.

## Content-Ergänzung

Erweitere `content.ts` um ein neues Feld für den Master-Orb:

```typescript
export const heroPond = {
  masterLink: {
    label: "Alle Projekte",
    href: "https://github.com/KikiKari/Projects",
    description: "Zum GitHub-Repo mit allen 9 Branches"
  }
};
```

Und pass die Hero-Section in `siteContent.hero` an: die alten `verbs` für die rotierende Headline bleiben, aber die `primary`/`secondary` CTAs werden zu subtileren Buttons unter dem Teich (nicht mehr Hauptaktion, weil der Teich die Interaktion trägt).

## Assets vorhanden

Alle unter `/public/media/pond/`:
- `seerosen/`: 5 HighRes Teich-Übersichten
- `blaetter/`: 4 HighRes Seerosenblätter (`12130585.webp` ist der Winner mit Clipping-Path)
- `wasser/`: 3 HighRes Wasser-Ripple-Texturen
- `blueten/`: 7 HighRes Einzelblüten
- `concepts/`: Moodboard v2 + Varianten A–D als visueller Referenzrahmen
- `manifest.json`: Full Katalog mit Attribution-URLs

## Attribution (Pflicht)

Ergänze in `components/site/footer.tsx` einen neuen Absatz:
```tsx
<p className="mt-4 text-xs text-footer-muted">
  Fotografische Basiselemente: <a href="https://www.vecteezy.com/" className="underline hover:text-footer-fg">Vecteezy</a> · 
  Lizenz gemäß <a href="https://api.vecteezy.com/free-photos/pad" className="underline hover:text-footer-fg">Vecteezy Free-Content-Attribution-Policy</a>
</p>
```

## Performance-Regeln

- Max Draw Calls: ~50
- Water-Shader max 2 Gerstner-Layer
- Lily pads: instanced mesh (`<Instances>` von drei/drei) — kein Overhead pro Instanz
- Bild-Assets: nur WebP laden (Fallback JPEG in `<picture>` bei Non-3D-Sektionen)
- Fallback bei WebGL disabled: `<noscript>` mit statischem Bild aus `concepts/variante-C.webp` als Hero-Cover

## Accessibility

- `<div role="application" aria-label="Interaktiver Teich mit Projektkugeln">`
- Focus-Ring auf Kugeln erreichbar via Tab-Key (statt Mouse)
- Enter-Taste auf fokussierter Kugel → gleiche Aktion wie Klick
- `prefers-reduced-motion`: Alle Übergänge deaktivieren, direkt "distributed"-Phase mit statischen Kugeln zeigen

## Fertigstellung

1. Lokaler Test: `cd /home/user/workspace/onboarding-repo && npm install && npm run dev` — Screenshot bei localhost:3000
2. Verifikation via `screenshot_page` (Screenshots im Bericht anhängen)
3. `git add . && git commit -m "feat: 3D-Teich-Hero mit interaktiven Glaskugeln + helle Projektliste" && git push origin pond-hero`
4. Am Ende: kurzer Bericht was gebaut wurde, Screenshots, offene Punkte

## Was NICHT zu tun ist

- Nicht die 9 Weltkugel-Frames in `public/media/globe-frames/` verwenden (die sind Legacy — wir haben keine Weltkugel mehr)
- Kein neuer WaveSpeed-Call (keine weiteren AI-Bilder generieren, alle Assets sind da)
- Nicht das Backend (`backend/`) anfassen
- Nicht `content.ts` `projects`-Array ändern (nur additive Ergänzung erlaubt)
- Nicht neue Routen anlegen — alles im bestehenden `app/page.tsx`
- Kein publish_website — nur `git push`, das Deployment übernimmt Vercel automatisch
