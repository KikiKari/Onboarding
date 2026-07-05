# Claude-Cowork-Dokumentationsanhang

Die bereitgestellten Cowork-Quellen bleiben unverändert erhalten. v4 ist die
aktuelle Dokumentationsgrundlage; v2 und v3 bleiben zur Nachvollziehbarkeit der
Zwischenstände archiviert.

| Datei | Rolle | SHA-256 |
|---|---|---|
| `Projektkontext_OnboardingandProjectPages_v4_utf8bom.md` | aktueller Projektkontext | `d55e898386b0f301ec209522644738f8fd2c4f637982e6d1faa39ac0135d853b` |
| `Projektkontext_LinksundErreichbarkeit_v4_utf8bom.md` | aktuelle Link- und Erreichbarkeitsmatrix | `03291ec2d50ac26307ce4b1b69f094c8c1788716d0efe9d7011f5d30c47e39fb` |
| `OnboardingandProjects_canvablock.html` | eigenständige Cowork-Ausarbeitung für Canva | `96e8663e926f71c6b1a355b794bf7ff5344b02ff0653455b4248fc26545b5836` |
| `Projektkontext_OnboardingandProjectPages_v3_utf8bom.md` | archivierter Zwischenstand (Codex-Übergabe) | `4a87c37453948a355e1f67d77f787316680205c0b85d4b414b7f6065222f0177` |
| `Projektkontext_LinksundErreichbarkeit_v3_utf8bom.md` | archivierte Link-Matrix v3 | `1a5d1bf58a011959c2252593d92b35b138acbd701183d4cfe1fad663606f9788` |
| `Projektkontext_OnboardingandProjectPages_v2_utf8bom.md` | archivierter Zwischenstand v2 | `47f25ed6cee1fa28c4a364d4e7a86c81cb26b3d77f861fb60578e6dbda456e1c` |

Der Canva-Block enthält keine Provider-Secrets. Er ist eigenständig, lädt aber
React, Babel, Three.js, D3, TopoJSON, Weltkarten- und Font-Ressourcen über
öffentliche CDNs. Für die Next.js-Produktion bleibt daher die lokale
Komponentenimplementierung maßgeblich; der Block dient als Canva-Import- und
visuelle Vergleichsquelle.

## Abgleich mit dem abgeschlossenen Codex-Stand

Die Cowork-v2 beschreibt einen Zwischenstand. Folgende Punkte sind inzwischen
abgeschlossen oder präzisiert:

- 4K-Anhang und Provider-Dokumentation sind abgeschlossen.
- Desktop- und Mobil-QA wurden im Browser durchgeführt.
- Beide Docker-Images wurden erfolgreich gebaut.
- Compose-Smoke-Test ist bestanden: Backend `healthy`, Frontend HTTP 200.
- Der finale Hero-Screenshot liegt unter `docs/hero-screenshot.png`.
- Das Kerstin-ONNX-Modell ist lokal vorhanden und validiert.
- Eine ausführbare sherpa-onnx-Runtime ist noch nicht installiert;
  `SHERPA_ONNX_RUNTIME_DIR` bleibt deshalb korrekt leer.
- Das Canva-Code-Design ist über den Browser editierbar, der Canva-Connector
  kann es jedoch trotz Freigabe und Offline-Verfügbarkeit nicht schreiben.
- Die finale Anwendung verwendet offline reproduzierbare System-Font-Stacks,
  damit Builds keine Google-Font-Downloads benötigen.
- Eine lokale, ignorierte `.env` wurde entsprechend der ausdrücklichen
  Projektfreigabe vervollständigt; Werte werden nicht dokumentiert.

Der aktuelle technische Status steht in:

- `README.md`
- `docs/PROJECT_CONTEXT_CLAUDE_COWORK.md`
- `docs/LINKS_AND_REACHABILITY.md`
- `docs/INTEGRATION_STATUS.md`
- `docs/PROVIDERS.md`
- `docs/SECRETS_AND_MONITORING.md`
- `docs/SHERPA_ONNX_TTS.md`
- `docs/SOURCES.md`
