---
name: onboarding-pond-hero-space
description: "Verweis-Skill für den Space 'Project-Landingpage'. Zeigt an dass die Arbeitsumgebung für dieses Projekt (KikiKari/Onboarding, Pond-Hero-Landingpage) im User-Skill 'onboarding-pond-hero' vollständig automatisiert ist. Verwende diesen Space-Skill wenn im aktuellen Space-Kontext (Project-Landingpage) an der Landingpage weitergearbeitet wird — er verweist auf den User-Skill für Auto-Setup, Sora-2-Workflow, Notion + Linear-Anbindung."
license: MIT
metadata:
  space: project-landingpage
  points_to: onboarding-pond-hero
---

# Project-Landingpage — Space-Verweis

## Wann verwenden

Du bist im Space **Project-Landingpage** (Full-Stack-Landingpage-Projekt für KikiKari/Onboarding). Diese Notiz verweist auf den vollen Setup-Skill.

## Was tun

1. **Lade den User-Skill:**
   ```
   load_skill(name="onboarding-pond-hero", scope="user")
   ```

2. Dieser enthält den kompletten Auto-Setup-Flow:
   - Git-Clone von `KikiKari/Onboarding`
   - Node + npm install
   - Optional: Blender + GIMP für Rendering
   - OpenAI Sora-2 direkt-API
   - Kontext aus Notion + Linear pullen
   - Design-System-Konventionen wiederherstellen

## Projekt-Ressourcen (in diesem Space verankert)

- **Notion Hauptseite:** [Onboarding and Project Pages](https://app.notion.com/p/3878d8ad3db98116a5d4f68d8c8ad717) — lebender Ist-Stand
- **Linear-Projekt:** [Onboarding and Project Pages](https://linear.app/0penclaw/project/onboarding-and-project-pages-77bce25304c7/overview) — aktive Milestones + Issues
- **GitHub:** [KikiKari/Onboarding](https://github.com/KikiKari/Onboarding) — push direkt auf main
- **Vercel:** `produkt-landingpage-3bb41d0a` (Team `openclaw-vercel-project`) — auto-deploy von main → [produkt-landingpage-3bb41d0a.vercel.app](https://produkt-landingpage-3bb41d0a.vercel.app/)
- **Canva-Design:** `DAHNVPU_Zmg` — [Edit-URL](https://www.canva.com/d/PS9SC7zOnRUKTs-) · [Shortlink](https://canva.link/mmgazbg6i0ml4b2) · [Live-Site](https://codex-full-stack.my.canva.site)

## Media-Priorität (Juli 2026)

- **Sora-2-Pro** primar für alle neuen Renderings (höhere Qualität, bessere Detail-Stabilität)
- **Sora-2** (12s) als Backup für Iteration und schnellere Tests
- **Nano Banana Pro** (WaveSpeed) für 9 transparente Glaskugeln

## Sprache

Alle Antworten in Standard-Deutsch. Direkt auf `main` pushen. Keine Feature-Branches.
