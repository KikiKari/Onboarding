import { mkdir, writeFile } from "node:fs/promises";

const key = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
if (!key) throw new Error("ELEVENLABS_API_KEY fehlt.");
const text = "Neun Projekte. Zwei Plattformen. Ein Ort, an dem Ideen verbunden und weiterentwickelt werden.";
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
  method: "POST",
  headers: { "xi-api-key": key, "Content-Type": "application/json" },
  body: JSON.stringify({
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: { stability: 0.58, similarity_boost: 0.72, style: 0.18, use_speaker_boost: true },
  }),
});
if (!response.ok) throw new Error(`ElevenLabs fehlgeschlagen: ${response.status}`);
await mkdir(new URL("../public/audio/", import.meta.url), { recursive: true });
await writeFile(new URL("../public/audio/project-narration.mp3", import.meta.url), Buffer.from(await response.arrayBuffer()));
await writeFile(new URL("../media-production/elevenlabs-result.json", import.meta.url), JSON.stringify({
  model: "eleven_multilingual_v2",
  voiceId,
  characters: text.length,
  text,
  output: "public/audio/project-narration.mp3",
}, null, 2));
console.log(`ElevenLabs abgeschlossen: ${text.length} Zeichen.`);
