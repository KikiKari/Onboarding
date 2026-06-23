# Provider-Integration

Stand: 21. Juni 2026

## WaveSpeed

Die Medienproduktion verwendet die WaveSpeed Prediction API ausschließlich als
lokales Build-Werkzeug. Der Schlüssel wird als `WAVESPEED_API_KEY` aus der
Prozessumgebung gelesen und entsprechend der offiziellen Dokumentation als
Bearer-Token übertragen. Er gelangt nicht in Next.js-Clientcode.

Der Produktionslauf umfasste sieben erfolgreiche 4K-Ausgaben mit
`google/nano-banana-2/edit`. Bei 0,14 USD pro Ausgabe entstanden 0,98 USD
Projektkosten. Die Aufladung des Anbieter-Kontos ist Guthaben und keine
Projektkostenposition.

Offizielle Dokumentation:

- https://wavespeed.ai/docs
- https://wavespeed.ai/docs/docs-api/api-authentication

## ElevenLabs

Die deutsche Kurz-Narration wurde serverseitig erzeugt und anschließend als
statische MP3 abgelegt. Im Browser befindet sich kein ElevenLabs-Schlüssel.
Verwendet wurde `eleven_multilingual_v2`; die in der Dokumentation als veraltet
markierten v1-Modelle werden nicht verwendet.

Der Lauf verbrauchte 93 Zeichen beziehungsweise Credits und erzeugte keine
zusätzlichen Kosten. Die erzeugte Free-Tier-Datei muss vor einer kommerziellen
Veröffentlichung entsprechend dem gewählten ElevenLabs-Tarif lizenziert oder
erneut erzeugt werden.

Offizielle Dokumentation:

- https://elevenlabs.io/docs/overview/intro
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert

## Geheimnisse und Protokolle

- `.env*` ist ignoriert; `.env.example` enthält nur Variablennamen.
- API-Schlüssel dürfen nicht in Prompts, Screenshots, Build-Ausgaben oder
  Provenienzdateien geschrieben werden.
- `pnpm secret:scan` prüft Quellcode, Git-Diff, Docker-Kontext und Build-Ausgabe.
- Anbieter-APIs sind nicht als öffentliche Website-Endpunkte exponiert.
