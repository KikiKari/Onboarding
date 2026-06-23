import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const directory = new URL("../public/media/", import.meta.url);
for (const file of await readdir(directory)) {
  if (!file.endsWith(".png")) continue;
  const source = new URL(file, directory);
  const stem = path.basename(file, ".png");
  await sharp(fileURLToPath(source)).webp({ quality: 84 }).toFile(fileURLToPath(new URL(`${stem}.webp`, directory)));
  await sharp(fileURLToPath(source)).avif({ quality: 58 }).toFile(fileURLToPath(new URL(`${stem}.avif`, directory)));
}
console.log("WebP- und AVIF-Derivate erzeugt.");
