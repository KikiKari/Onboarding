# Visuelle QA in der Sandbox

Damit neu erzeugte Ergebnisse (gerenderte Seiten, Videos, Bilder, 3D-Renders)
**vor der Weiterverwendung selbst betrachtet** werden können, stellt die Sandbox
eine vollständige visuelle Kette bereit. Alles wird vom SessionStart-Hook
(`scripts/sandbox-setup.sh`) automatisch eingerichtet.

## Werkzeuge

| Zweck | Werkzeug | Hinweis |
|---|---|---|
| Web-Rendering mit Video | **Google Chrome Stable** | bringt H.264/AAC-Codecs mit — der Playwright-Bundle-Chromium zeigt MP4s schwarz |
| Headless-Anzeige | **Xvfb** | virtueller X-Server für „headed"-Läufe (echte Web-Logins, Autoplay) |
| Multi-Browser | Playwright + Firefox/WebKit | optional; Chrome ist der Standard mit Codecs |
| Bildbearbeitung | **GIMP** (Script-Fu, headless) | `gimp -i -b '(...)'` |
| 3D-Render | **Blender** (`-b -P script.py`) | EEVEE/Cycles, schreibt PNG |
| Video/Frames | **ffmpeg**, **ImageMagick** | Frame-Extraktion, Kontaktbögen |

## Netzwerk-Besonderheit (wichtig)

Der Sandbox-Egress läuft über einen MITM-Proxy (`HTTPS_PROXY`, CA unter
`/root/.ccr/ca-bundle.crt`). Zwei Anpassungen sind nötig, sonst scheitert
externes Surfen:

1. **Proxy-CA im Chrome-NSS-Store** (`certutil … -n ccr-proxy-ca`) — sonst
   Zertifikatsfehler. Erledigt das Setup-Skript.
2. **`--ssl-version-max=tls1.2`** — der Proxy resettet Chromes TLS-1.3-Handshake
   (`ERR_CONNECTION_RESET`). Mit TLS 1.2 max läuft der re-terminierte Tunnel.
   Fest in `visual-qa.mjs` und `browser-session.mjs` verdrahtet.

Interne Ziele (`localhost:3000`) sind Proxy-Bypass und immer erreichbar.

## Multi-Auflösungs-Screenshots — `scripts/visual-qa.mjs`

Rendert eine laufende Seite in mehreren Auflösungen (Desktop 1920/1366, Laptop
1440, Tablet 1024, Mobile 390) und speichert PNGs — die Positionen der Elemente
sind so je Auflösung überprüfbar.

```bash
xvfb-run -a node scripts/visual-qa.mjs http://localhost:3000 \
  --engines chrome --out /tmp/visual-qa --wait 4000
xvfb-run -a node scripts/visual-qa.mjs http://localhost:3000 --click "Alle Projekte"
```

Ausgabe pro Screenshot inkl. `data-pond-phase`, damit der Interaktionszustand
(idle/distributed) belegt ist.

## Persistente Web-Sitzung mit Login — `scripts/browser-session.mjs`

Für Plattformen ohne nutzbare API (WaveSpeed-Konsole, Perplexity, Canva,
Stock-Portale): echtes Chrome mit **dauerhaftem Profil** unter
`.browser-profile/` (gitignored). Cookies/LocalStorage bleiben über Läufe hinweg
erhalten; Cookie-Banner werden automatisch akzeptiert.

```bash
xvfb-run -a node scripts/browser-session.mjs open  https://polyhaven.com/de   # öffnen + Cookies + Screenshot
xvfb-run -a node scripts/browser-session.mjs login https://…  --env-user X --env-pass Y
xvfb-run -a node scripts/browser-session.mjs state                             # gespeicherte Cookie-Domains
```

Credentials kommen ausschließlich aus der `.env` (nie geloggt, nie committet).
Das Formular wird ausgefüllt, aber **nicht automatisch abgesendet** — erst nach
Sichtprüfung des Screenshots.

## GIMP / Blender — Beispiel

```bash
gimp -i -b '(let* ((img (car (gimp-image-new 400 200 RGB)))) …)' -b '(gimp-quit 0)'
blender -b -P render.py    # render.py setzt Engine, Auflösung, filepath, ops.render.render(write_still=True)
```

Danach das erzeugte PNG betrachten (im Chat via Bild-Anzeige), bevor es ins
Projekt übernommen wird.
