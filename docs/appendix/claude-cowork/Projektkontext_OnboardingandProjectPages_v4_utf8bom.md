# Projektkontext — "Onboarding and Project Pages" (v4)

> Stand: 27. Juni 2026 · konsolidierte Fassung · reine Dokumentation, keine Eingriffe
> v4 ergänzt v3 um den zweiten Designlauf (Seerosen-/3D-Motivwelt), die neuen Asset-/3D-Quellen und den **Übergang zur Umsetzung in Perplexity (Perplexity Computer + Claude Fable 5)**.
> Namens-Konvention: Repo = `Onboarding`; Produkt-/Projektname = „Onboarding and Project Pages".

---

## 1. Ausgangsstand (aus v3, unverändert gültig)
- GitHub: `KikiKari/Onboarding` (public, MIT), App + `docs/`, Release `v1.0.0`.
- Vercel: `produkt-landingpage-3bb41d0a` (Git-verbunden), Prod READY.
- Linear: Projekt „Onboarding and Project Pages" (Team 0penClaw), Completed.
- Notion: Hauptseite + 5 Unterseiten.
- Canva: „Produkt Landingpage" (Code-Design, veröffentlicht als `codex-full-stack.my.canva.site`).
- Stack: Next.js (App Router)+TS, Tailwind-Tokens, Framer Motion, FastAPI, Docker.
- Offen aus v3: OG-Bild-Fix (`metadataBase`), Backend→AWS + `NEXT_PUBLIC_API_BASE_URL`, GitHub-„About"/Topics, Secrets rotieren.

## 2. Zweiter Designlauf (Codex-Session `019f09b1-…`)
Ziel: den mangelhaften ersten Redesign-Stand (statisches Bild) im **bestehenden** Projekt ersetzen — mit echtem 3D/Bewegung statt Collage.

- **Verbindlicher Bildpool:** die **acht hochauflösenden Originale** in `design-reference/examples`: `element_01_glass_bowl`, `element_02_beads_group`, `element_03_single_bead`, `element_04_feather`, `comp_01_peonies_dark`, `comp_02_peonies_warm`, `anita-austvika-…unsplash.jpg`, `katya-azimova-…unsplash.jpg`. Die `var*.png` sind **nur Vorlagen** (nicht 3D/final).
- **Motivwelt:** dunkle Pfingstrosen/Seerosen als räumlicher, mehrschichtiger Hintergrund; Glasschale + echte 3D-Kugeln; monochrome Strich-Weltkugel; Bewegungslogik (Lichtimpuls → Kugeln lösen sich → fallen/federn/rollen → beschriftete Projektkugeln). Keine statische Collage.
- **Pflicht-Werkzeuge (nicht optional):** WaveSpeed (inkl. **Tripo3D H3.1** image-to-3d / multiview-to-3d), **NVIDIA NIM** (`integrate.api.nvidia.com`, u. a. `nvidia/usdcode` / Kimi-K2.6 für USD-/3D-Code), **Blender** (3D-Modellierung/Rendering), **GIMP 3.2.4** (lokal) und **ImageMagick 7.1.2-26 portable** (projektlokal `.tools/imagemagick/runtime`, Hash verifiziert), Framer Motion, Sherpa.
- **3D-Quellen:** Sketchfab „water-lily-collection", plus Stock-Recherche über Pixabay/Unsplash/Vecteezy/iStock/Freepik/Adobe Stock u. a.
- **Arbeitsmodus:** jeder Teilschritt einzeln zur Freigabe; bestehende Umgebung/Repo wird genutzt, kein neuer Dev-Container. Hero-Entwurf war freigegeben.

## 3. Übergang zu Perplexity (aktuelle Umsetzungsebene)
Das gesamte Projekt wird nun in **Perplexity** mit **Perplexity Computer** und **Claude Fable 5** weiter umgesetzt.
- Laufender Prozess (freigegeben, auth-gebunden): `https://www.perplexity.ai/computer/tasks/0a748f67-db03-4a2a-a942-6b05e4612915?view=thread`
- Generierte Zwischen-Outputs liegen auf WaveSpeed-CDN (`d2p7pge43lyniu.cloudfront.net/output/…png`, temporär).

## 4. Sicherheits-/Secrets-Hinweis ⚠️
Neu im v4-Lauf lokal in der (gitignorierten) Projekt-`.env` abgelegt: **`VECTEEZY_API_KEY`** und **`NVIDIA_CODEX`** (`nvapi-…`). Zusammen mit den früheren (WaveSpeed, ElevenLabs, Docker-PAT, alles in `missing.md`): **als offengelegt behandeln und rotieren**, nur als lokale Env/Vault halten, nie committen. **In diesem Dokument stehen keine Schlüsselwerte.**

## 5. Ausarbeitbare Stellen / offene Punkte
1. OG-Bild-Fix in `app/layout.tsx` (`metadataBase` → echte Domain).
2. Backend→AWS + `NEXT_PUBLIC_API_BASE_URL` setzen (Formular sonst Demo-Hinweis).
3. GitHub-„About"/Topics/Website ergänzen.
4. Zweiter Designlauf: 3D-Assets final produzieren (Sketchfab/Tripo3D/Blender), in Hero/Sektionen integrieren, Abnahme je Teilschritt.
5. Perplexity-Umsetzung: Ergebnis mit dem Vercel-/GitHub-Stand zusammenführen (Quelle konsistent halten).
6. Secrets rotieren (inkl. VECTEEZY_API_KEY, NVIDIA_CODEX).
7. Canva-Code-Design ggf. angleichen (manuell im Editor).

## 6. Korrekturen & Formalisierungen
- `var*.png` = nur Vorlagen, **nicht** finale 3D-Assets.
- ImageMagick ist Open-Source-CLI-Software (portable, projektlokal), keine „Webseite".
- `docs.codex.io` ≠ OpenAI Codex.
- Cowork-Markdown als UTF-8 (mit BOM) ablegen.
- Codex-„Report/Incident"-Teil gehört thematisch nicht zum Projekt und ist hier bewusst ausgeklammert.

---
*Quellen: v4-Chatverlauf (Codex-Designlauf), GitHub/Vercel/Linear/Notion (v3), Perplexity-Task (auth). Keine Secrets enthalten.*
