# Optionale Offline-TTS mit sherpa-onnx

Diese Option ergänzt die bereits erzeugte statische ElevenLabs-Narration. Sie
ist nicht erforderlich, um die Website zu bauen oder auszuführen.

## Vorgesehene Stimme

- Modell: `vits-piper-de_DE-kerstin-low`
- Sprache/Stimme: Deutsch, Kerstin, niedrige Modellgröße
- Modellarchiv:
  https://sourceforge.net/projects/piper-tts.mirror/files/v0.0.2/voice-de-kerstin-low.tar.gz/download
- Referenzskript und Modellstruktur:
  https://huggingface.co/csukuangfj/vits-piper-de_DE-kerstin-low/blob/main/vits-piper-de_DE.sh

Das Referenzskript dokumentiert die für das VITS/Piper-Modell erforderlichen
Modell-, Token- und espeak-ng-Daten. `tokens.txt` gehört zum Modellverzeichnis
und darf nicht durch einen beliebigen Tokenizer ersetzt werden.

## Lokale Variablen

```dotenv
SHERPA_ONNX_RUNTIME_DIR=C:\absolute\path\to\tools\sherpa-onnx-tts\runtime
SHERPA_ONNX_MODEL_DIR=C:\absolute\path\to\tools\sherpa-onnx-tts\models\vits-piper-de_DE-kerstin-low
```

Das Modell ist lokal vorhanden und `SHERPA_ONNX_MODEL_DIR` verweist auf:

`C:\Users\silve\Documents\Codex\Claude Design\design-reference\voice-de-kerstin-low`

Validierte Dateien:

- `de-kerstin-low.onnx` – 63.104.526 Bytes
- `de-kerstin-low.onnx.json` – 5.773 Bytes
- `MODEL_CARD` – 260 Bytes

Archiv:

- `voice-de-kerstin-low.tar.gz` – 55,56 MiB
- SHA-256:
  `d8ea72fbc0c21db828e901777ba7bb5dff7c843bb943ad19f34c9700b96a8182`

`SHERPA_ONNX_RUNTIME_DIR` bleibt leer, bis eine ausführbare Windows-x64-
Runtime installiert wurde. Das Modellverzeichnis allein ist keine Runtime.

## Runtime-Optionen

Primäre und bevorzugte Quelle:

- Repository: https://github.com/k2-fsa/sherpa-onnx
- offizielle Releases und vorgebaute Binaries:
  https://github.com/k2-fsa/sherpa-onnx/releases
- Installationsdokumentation:
  https://k2-fsa.github.io/sherpa/onnx/index.html

Integrationsbeispiele:

- Python Offline-TTS:
  https://github.com/k2-fsa/sherpa-onnx/blob/master/python-api-examples/offline-tts.py
- Python-Beispiele:
  https://github.com/k2-fsa/sherpa-onnx/tree/master/python-api-examples
- Node.js-/JavaScript-Beispiele:
  https://github.com/k2-fsa/sherpa-onnx/tree/master/nodejs-examples
- C++-Kern/API:
  https://github.com/k2-fsa/sherpa-onnx/tree/master/sherpa-onnx/csrc

Community-Docker-Image:

- https://hub.docker.com/r/yaming116/sherpa-onnx-docker

Das Community-Image wird nicht ungeprüft in `docker-compose.yml` aufgenommen.
Vor einer produktiven Verwendung sind mindestens Versions-Pinning,
Image-Digest, Architektur, enthaltene Binaries, Lizenz und ein lokaler
Smoke-Test zu prüfen.

## Installations- und Laufzeitgrundlage

Die offizielle Dokumentation fordert eine installierte sherpa-onnx-Laufzeit,
bevor TTS verwendet wird. Das Projekt kann später wahlweise einen lokalen
CLI-Prozess oder die Python-/Node-API aufrufen und das Ergebnis als statische
Audiodatei unter `public/audio/` ablegen.

Quellen:

- https://k2-fsa.github.io/sherpa/onnx/tts/index.html
- https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/index.html
- https://github.com/k2-fsa/sherpa-onnx#supported-functions
- https://github.com/k2-fsa/sherpa-onnx#supported-platforms
- https://github.com/k2-fsa/sherpa-onnx#supported-programming-languages
- https://github.com/k2-fsa/sherpa-onnx#supported-npus
- https://github.com/CodeBySonu95/VoxSherpa-TTS/releases
- https://open-vsx.org/extension/analytics-in-motion/wake-word

Sherpa-onnx deckt darüber hinaus Offline-STT, TTS, Diarisierung,
Sprachverbesserung, Quellentrennung, VAD und Keyword Spotting ab. Unterstützte
Ziele umfassen unter anderem Windows/x86_64, Embedded-Systeme, Android, iOS,
Raspberry Pi, RISC-V sowie mehrere NPU-Plattformen. APIs stehen für C++, C,
Python, Go, C#, Java, Kotlin, JavaScript, Swift, Rust, Dart und Object Pascal
zur Verfügung.

## Entscheidung für den aktuellen Stand

Es erfolgt kein automatischer Download und keine zweite Sprachgenerierung:

- die finale MP3 ist bereits vorhanden;
- die Website benötigt zur Laufzeit keine TTS-Engine;
- der zusätzliche Download würde Build- und Docker-Kontexte unnötig vergrößern;
- Runtime und Modelle gehören in einen lokalen Tool-/Cache-Bereich, nicht ins
  Repository.
