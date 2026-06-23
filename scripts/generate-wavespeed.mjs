import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const key = process.env.WAVESPEED_API_KEY;
if (!key) throw new Error("WAVESPEED_API_KEY fehlt.");

const jobs = JSON.parse(await readFile(new URL("../media-production/wavespeed-jobs.json", import.meta.url), "utf8"));
const rawDir = new URL("../media-production/raw/", import.meta.url);
const publicDir = new URL("../public/media/", import.meta.url);
await mkdir(rawDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

const resultUrl = new URL("../media-production/wavespeed-results.json", import.meta.url);
const log = JSON.parse(await readFile(resultUrl, "utf8").catch(() => "[]"));
for (const job of jobs) {
  const rawPath = new URL(`${job.id}.png`, rawDir);
  const targetPath = new URL(`${job.output}.png`, publicDir);
  const alreadyGenerated = await access(rawPath).then(() => true).catch(() => false);
  if (alreadyGenerated) {
    if (!log.some((entry) => entry.id === job.id)) {
      log.push({ id: job.id, requestId: "completed-before-resume", model: "google/nano-banana-2/edit", resolution: "4k", plannedCostUsd: 0.14, output: path.basename(targetPath.pathname) });
      await writeFile(resultUrl, JSON.stringify(log, null, 2));
    }
    console.log(`Übersprungen: ${job.id} ist bereits vorhanden.`);
    continue;
  }
  const images = await Promise.all(job.images.map(async (image) => {
    if (/^https?:|^data:/.test(image)) return image;
    const bytes = await readFile(new URL(`../${image}`, import.meta.url));
    return `data:image/png;base64,${bytes.toString("base64")}`;
  }));
  const response = await fetch("https://api.wavespeed.ai/api/v3/google/nano-banana-2/edit", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: job.prompt,
      images,
      aspect_ratio: job.aspectRatio,
      resolution: "4k",
      output_format: "png",
      enable_web_search: false,
      enable_image_search: false,
      enable_sync_mode: false,
      enable_base64_output: false,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`WaveSpeed submit fehlgeschlagen: ${response.status} ${detail}`);
  }
  const submitted = await response.json();
  const requestId = submitted.data?.id ?? submitted.id;
  let result;
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    const poll = await fetch(`https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    result = await poll.json();
    if (result.data?.status === "completed") break;
    if (result.data?.status === "failed") throw new Error(`WaveSpeed job fehlgeschlagen: ${job.id}`);
  }
  const url = result?.data?.outputs?.[0];
  if (!url) throw new Error(`Kein Output für ${job.id}`);
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(rawPath, bytes);
  await writeFile(targetPath, bytes);
  log.push({ id: job.id, requestId, model: "google/nano-banana-2/edit", resolution: "4k", plannedCostUsd: 0.14, output: path.basename(targetPath.pathname) });
  await writeFile(resultUrl, JSON.stringify(log, null, 2));
  console.log(`Abgeschlossen: ${job.id}`);
}
await writeFile(resultUrl, JSON.stringify(log, null, 2));
console.log(`WaveSpeed abgeschlossen: ${log.length} Assets, geplante Basiskosten $${(log.length * 0.14).toFixed(2)}.`);
