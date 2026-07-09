# Arbeitsanweisung — Claude Code (eigene Sandbox + Diff-Sync zu lokalem Docker)

> Projekt: „Full-Stack-Landingpage / Onboarding and Project Pages" · Repo `KikiKari/Onboarding`, Branch `main` (Basis-Commit `25a0828`).
> Ziel-Topologie: Claude Code arbeitet in einer eigenen, dauerhaften Umgebung; das lokale Docker des Nutzers wird nur inkrementell synchron gehalten.

---

## Rolle & Ziel
Führe das Projekt fort. Richte für dich eine **eigene, dauerhaft verfügbare Entwicklungsumgebung** ein (dedizierte, langlebige Sandbox bzw. Dev-Container mit eigenem Docker), in der du frei und schnell arbeitest. **Rechen-/kostenintensive und vorbereitende Arbeit** — WaveSpeed, OpenAI Sora/gpt-image, NVIDIA NIM, ElevenLabs, Blender-Renders, ffmpeg, hochauflösende Grafiken/Animationen — läuft dort, **nicht** auf der lokalen Maschine des Nutzers.

Hinweis: „eigene persistente Sandbox" ist je nach Betrieb ein **dedizierter, langlebiger Dev-Container (lokal, getrennt von den Anzeige-Containern)** oder eine **Cloud-/Remote-Umgebung**. Wähle die konkret machbare Variante und benenne sie im Statusbericht.

## Quelle der Wahrheit
GitHub `KikiKari/Onboarding`. Übernimm den vorhandenen Stand `main` (aktuell Commit `25a0828` „wide-idle-v2 als Idle + 9 Kugeln auf 4 Blättern") als Basis. Arbeite auf `main` bzw. einem Arbeitsbranch und committe dorthin. **Nicht** neu aufsetzen — bestehenden Stand sichten und übernehmen.

## Sync-Brücke zum lokalen Docker
Halte die lokale Umgebung des Nutzers (`onboardingandprojectpages-frontend-1` / `-backend-1`, `localhost:3000` / `:8000`) **automatisch synchron, aber nur inkrementell**:
- geänderte Dateien / Git-Diffs statt ständigem Voll-Rebuild des gesamten Branch;
- Dev-Server-Hot-Reload bzw. gemountete Volumes bevorzugen, damit die Ansicht auf `localhost:3000` immer aktuell ist;
- **vollständiger Rebuild nur** bei echten Abhängigkeits-/Image-Änderungen (`package.json`, Lockfile, Dockerfile, requirements);
- Ziel: maximale Aktualität bei minimalem Download-/Bau-Aufwand auf Nutzerseite.

## Erst sichten, dann berichten
Verschaffe dir zuerst rein lesend einen vollständigen Überblick, bevor du etwas änderst:
- Git-/Branch-Stand; App-Struktur (`components/site/pond*`, `app/`, `content.ts`, Docker/Compose);
- `.env` / `.env.example`;
- Doku unter `docs/`, insbesondere die **V6-Dokumentation** (Projektkontext + Link-/Erreichbarkeitsliste) und die **Storyline** (`story-flow.md`) des Pond-Hero;
- die bereits laufenden lokalen Container.

Liefere danach einen **Statusbericht** inkl.: gewählte Sandbox-/Sync-Topologie, Sync-Mechanik, aktueller Stand, offene Punkte und die vorgeschlagenen nächsten Teilschritte zur Freigabe.

## Tools & Zugänge
Installiere/prüfe in deiner Umgebung alle laut V6-Doku nötigen Werkzeuge — u. a. **GIMP, Blender (headless), ffmpeg, Playwright, ImageMagick, `<model-viewer>`** — und mache die Provider-Zugänge einsatzbereit (OpenAI Sora/gpt-image, WaveSpeed/Tripo3D/Hunyuan3D, NVIDIA NIM, ElevenLabs, Vecteezy u. a.). Prüfe, was schon vorhanden ist, und ergänze nur Fehlendes.

Migriere die vorhandenen Zugänge (API-Keys, Tokens, Credentials, Cookies, `.env`) in deine Umgebung. Wo schnelle APIs nicht möglich sind, sind **Web-/Browser-Sitzungen inklusive Anmeldung** in deiner Sandbox zulässig. Halte alle Secrets ausschließlich in der Umgebungs-`.env`/Vault — **nichts committen**; bereits offengelegte Schlüssel als kompromittiert behandeln und Rotation vorschlagen.

## Arbeitsweise
Nach der Sichtung **Teilschritt für Teilschritt**; vor jedem substanziellen oder kostenpflichtigen Schritt (Code-Änderung, Build, Provider-/Kostenaufruf) die Entscheidung des Nutzers einholen. Fortgeführt wird der **Pond-Hero** gemäß Storyline und den offenen QA-Punkten der V6-Doku.
