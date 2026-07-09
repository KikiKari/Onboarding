# Pond-Hero — Story-Flow

> Rekonstruiert am 9. Juli 2026 aus README-Vision, v6-Projektkontext (QA-Punkte)
> und dem Code-Stand `components/site/pond-experience.tsx` („Pond Experience V8",
> `main@25a0828`). Das Original lag im User-Skill `onboarding-pond-hero` und war
> nicht im Repo — diese Datei macht die Storyline im Repo zur Quelle der Wahrheit.

## Leitidee

Der Nutzer landet auf einer ruhigen Teichszene bei goldenem Licht. Eine
Master-Glaskugel ruht auf einem Seerosenblatt. Beim Klick rollt sie ins Wasser,
ein Splash bedeckt kurz die Sicht — und aus dem Splash tauchen neun kleine
Glaskugeln auf, jede eine der neun Projektseiten. Kein Bildschnitt, ein
durchgehendes Video als Bühne. Jede Interaktion ist ein einzelner klarer Moment.

## Soll-Storyline (Phasen)

| # | Phase | Trigger | Bühne |
|---|---|---|---|
| 1 | `idle` | Seitenaufruf | `wide-idle-v2.mp4` (12 s Loop, Sonnenuntergang), Master-Kugel real im Video |
| 2 | `hover-master` | Hover/Focus auf Master-Kugel | Kugel-Scale 1.15 + Hover-Card „Alle Projekte / 9 Projekte" |
| 3 | `rolling` | Klick auf Master-Kugel | Kugel rollt vom Blatt ins Wasser (Video-Übergang, gleiche Komposition wie Idle) |
| 4 | `splash` | automatisch nach 3 | Vollflächiger Splash im Vordergrund; rechtes/vordere Blätter dürfen nicht „verschluckt" werden — dort landen die Kugeln |
| 5 | `distributed` | automatisch nach 4 | 9 Projektkugeln (gpt-image-2, `glass-orbs-v2/orb-01…09`) erscheinen **erst nach** dem Splash auf den Blättern |
| 6 | `hover-project` | Hover/Focus auf Projektkugel | Kugel-Scale ×1.2 + Hover-Card (Titel, Plattform, Summary) |
| 7 | `click-splash` | Klick auf Projektkugel | Vollbild-Splash (`rolling-splash-v3.mp4`) + „Öffne <Projekt>", danach GitHub-Link in neuem Tab |

Reduced Motion: direkt `distributed`, Klick öffnet Links ohne Splash.

## Ist-Stand V8 (`main@25a0828`)

- Phasen im Code: `idle | hover-master | distributed | hover-project | click-splash`.
- **Lücke zur Soll-Storyline:** Phasen 3+4 (`rolling`/`splash` nach Master-Klick)
  sind nicht implementiert — Master-Klick springt direkt zu `distributed`.
  `rolling-splash-v4/v5.mp4` liegen in `public/media/hero-v2/videos/` bereit,
  sind aber nicht eingebunden. v5 sollte mit `input_reference` zur
  wide-idle-v2-Komposition passen (v6-QA), nicht die frühere Fremdszene.
- Master-Kugel: real im Idle-Video bei **44 % / 79 %**, Klickbox
  `clamp(180px, 28vh, 340px)` — Deckung Klickbox↔Video-Kugel ist offener
  QA-Punkt (neu vermessen; Fehlklick darf die Sequenz nicht resetten).
- 9 Kugeln auf **4 Blättern** (User-Vorgabe, ersetzt die v6-Zone „rechtes Blatt
  x=50–91 % / y=46–69 %"): vorne links 3 (12/63, 24/65, 32/62), vorne rechts 2
  (74/72, 84/72), hinten links 2 (34/48, 42/47), hinten rechts 2 (58/40, 64/40)
  — hinten kleiner (Perspektive, scale 0.48–0.75).
- Audio: noch keins. Geplant: Teich-Ambience + Splash via ElevenLabs
  `sound-generation` (muted-Autoplay-konform, erst nach User-Geste hörbar).

## Offene QA-Punkte (aus v6, gegen V8 aktualisiert)

1. Master-Splash-Sequenz (Phasen 3+4) reintegrieren — Splash passend zur
   Idle-Komposition; Kugeln erst nach dem Splash sichtbar.
2. Hitbox der Master-Kugel gegen `wide-idle-v2` neu vermessen (Playwright).
3. Wasser: mehr realistische Bewegung/Tropfen aus dem Splash heraus,
   unrealistische Tropfen entfernen.
4. Kugel-Feinjustage auf den 4 Blättern (Positionen/Perspektive), ggf. neue
   gpt-image-2-Renderings aus `master.png`.
5. Audio-Einbindung (ElevenLabs + CC0-Quellen).

## Asset-Referenz

- Idle: `public/media/hero-v2/videos/wide-idle-v2.mp4` (Basis-Komposition)
- Splash-Iterationen: `rolling-splash-v2…v5.mp4` (v5 = jüngste, für Master-Splash)
- Projekt-Klick-Splash: `rolling-splash-v3.mp4` (aktuell eingebunden)
- Kugeln: `public/media/hero-v2/glass-orbs-v2/orb-01…09.png` (gpt-image-2)
- Historie/Experimente: `development/` (Sora/Veo/Seedance, Frames, 3D, Mockups)
