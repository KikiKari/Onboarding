# Projektkontext — "Onboarding and Project Pages" (v5)

> Stand: 5. Juli 2026 · konsolidierte Fassung · reine Dokumentation
> v5 ergänzt v4 um die **Pond-Hero-Weiterentwicklung in Perplexity** (Perplexity Computer + Claude Fable 5) und den aktuellen QA-Stand. Inhalte wurden von Perplexity auf **GitHub (`main`), Notion, Canva, Linear und Vercel** aktualisiert.
> Perplexity-Session: `54c04bf0-5780-433d-9cac-ab93f3ff7fd9` (Pond-Hero, 4.–5. Juli 2026).

---

## 1. Ausgangsstand (v1–v4, weiter gültig)
- GitHub `KikiKari/Onboarding` (public, MIT), Vercel-Prod `produkt-landingpage-3bb41d0a`, Linear-Projekt „Onboarding and Project Pages", Notion (Haupt + 5 Unterseiten), Canva-Code-Design.
- Stack: Next.js (App Router)+TS, Tailwind-Tokens, Framer Motion, FastAPI, Docker.
- Zweiter Designlauf (Seerosen/3D) + Werkzeuge WaveSpeed/Tripo3D, NVIDIA NIM, Blender, GIMP, ImageMagick (siehe v4).

## 2. Aktueller Umsetzungsstand — Pond-Hero (Perplexity)
Das Projekt wird in **Perplexity Computer + Claude Fable 5** weiterentwickelt; die zentrale neue Arbeit ist der interaktive **Pond-Hero**.

- Code: `components/site/pond` (Branch `main`; Feature-Branch `pond-hero`, Commit `404a863`).
- Konzept: Idle-Video (Seerosenteich, ruhender „Master-Orb" auf linkem Blatt) → Klick auf Orb → Orb rollt → Splash-Landung im Teich → **9 kleine Projektkugeln** auf dem rechten Blatt.
- Medien-Pipeline: **OpenAI Sora 2 / Sora-2-Pro** (Video, `api.openai.com/v1/videos`), **gpt-image-2** (Bild, image-to-image von `master.png`), **WaveSpeed Nano Banana Pro** + **Tripo3D / Hunyuan3D** (3D), HDRI/Texturen (Poly Haven, AmbientCG), Stock (Vecteezy-API u. a.).
- Perplexity hat parallel Content in Notion, Canva (neue Designs), Linear (neue Issues/Projekte) und Vercel aktualisiert.
- Zusätzlicher Perplexity-Deploy: `weather-check.pplx.app`.

## 3. Offene QA-Punkte am Pond-Hero (aus laufender Session)
A. **Klick-Hitbox verschoben** — Master-Orb `left:38% / top:68%` deckt sich nicht mit der Kugelposition im Video (Klickpunkt liegt rechts daneben). → Position neu aus dem aktuellen Idle-Video ausmessen.
B. **9 Kugeln = Ring-Optik** — die aktuellen `orb-glass-*.png` (Nano-Banana) wirken klein skaliert wie schwarze Ringe. → neue Sprites via **gpt-image-2 image-to-image** aus `master.png`.
C. **9 Kugeln im Idle sichtbar** — Layer-Sichtbarkeit greift nicht; sollen erst **nach dem Splash** erscheinen.
D. **Splash zeigt falsche Szene** — `rolling-splash-v2.mp4` ist ein anderes Sora-Video (Sonnenuntergang/Silhouette) statt der Idle-Komposition. → neues **Sora-2-Pro-Splash mit `input_reference` des Idle-Frames** (oder CSS-Splash über das Idle-Video).
E. **Wasser/Positionen** — Teichwasser soll mehr Bewegung haben; die 9 Kugeln aufs rechte Blatt legen, spiegelbildlich zum Orb links.

## 4. Integrationen (durch Perplexity aktualisiert)
- **GitHub:** `main` aktualisiert, Pond-Code unter `components/site/pond`, Feature-Branch `pond-hero`.
- **Vercel:** Prod `produkt-landingpage-3bb41d0a`; Deploy-/pnpm-Lockfile-Themen dokumentiert.
- **Linear:** Projekt „Onboarding and Project Pages" + neu **Development-Ops**, **Vision-Check**, **Weather-Check**; Issues **0PE-37** (Klick löst keine Aktion aus), **0PE-38** (Kugelpositionen aufs 20s-Idle-Video), **0PE-39** (Idle→Splash in einem Take), **0PE-40** (Docker-Build vereinfachen).
- **Notion:** Projektseiten + neue **Development & Ops**-Seite.
- **Canva:** bestehendes Code-Design + neue Designs (`design.canva.ai/5bKpr40zJLw6Mdf`, `canva.com/d/PS9SC7zOnRUKTs-`).

## 5. Sicherheits-/Secrets-Hinweis ⚠️
Im v5-Lauf zusätzlich im Einsatz (lokal/Env): **OpenAI** (Sora/gpt-image), **Anthropic Claude**, **OpenRouter**, **WaveSpeed**, **NVIDIA** (`nvapi-…`), **Vecteezy** (`VECTEEZY_API_KEY`), früher WaveSpeed/ElevenLabs/Docker-PAT. **Als offengelegt behandeln und rotieren**, nur gitignored/Env, nie committen. **Keine Schlüsselwerte in diesem Dokument.**

## 6. Ausarbeitbare Stellen / offene Punkte
1. Pond-Hero-Fixes A–E (siehe §3).
2. OG-Bild-Fix in `app/layout.tsx` (`metadataBase`).
3. Backend→AWS + `NEXT_PUBLIC_API_BASE_URL`.
4. GitHub-„About"/Topics; ggf. `pond-hero` → PR/Merge nach `main`.
5. Vercel-pnpm-Lockfile-/Build-Konfiguration stabil halten (mehrere Community-Referenzen gesammelt).
6. Secrets rotieren (§5).

## 7. Korrekturen & Formalisierungen
- `var*.png` nur Vorlagen; `orb-glass-*.png` als Sprites unbrauchbar (→ ersetzen).
- Sora-2 erzeugt nur Videos, keine Standbilder → Standbilder via gpt-image-2.
- `docs.codex.io` ≠ OpenAI Codex.
- Cowork-Markdown als UTF-8 (mit BOM).
- Codex-„Report/Incident"-Teil bleibt ausgeklammert.

---
*Quellen: Perplexity-Pond-Hero-Session (Transcript + 261 kuratierte Links), v4-Basis, GitHub/Vercel/Linear/Notion/Canva. Keine Secrets enthalten.*
