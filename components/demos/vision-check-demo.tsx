"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Detection = { label: string; confidence: number; x: number; y: number };

const seed: Detection[] = [
  { label: "Blüte", confidence: 96, x: 24, y: 32 },
  { label: "Grasstruktur", confidence: 91, x: 58, y: 54 },
  { label: "Insektenspur", confidence: 77, x: 76, y: 28 },
];

export function VisionCheckDemo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("/media/feature-spotlight.png");
  const [contrast, setContrast] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [detections, setDetections] = useState<Detection[]>([]);
  const filter = useMemo(() => `contrast(${contrast}) brightness(${brightness})`, [brightness, contrast]);

  function upload(file?: File) {
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setDetections([]);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-4"><h2 className="font-semibold">Bildquelle</h2><span className="font-mono text-xs text-muted">LOCAL</span></div>
        <div className="p-4">
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius-md)] bg-ink">
            <Image src={image} alt="Aktuelles Analysebild" fill unoptimized={image.startsWith("blob:")} className="object-cover" style={{ filter }} />
            {detections.map((item) => (
              <span className="absolute rounded border border-accent bg-bg/85 px-2 py-1 font-mono text-[0.6875rem] text-accent" style={{ left: `${item.x}%`, top: `${item.y}%` }} key={item.label}>{item.label} · {item.confidence}%</span>
            ))}
          </div>
          <input ref={inputRef} className="hidden" type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])} />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" onClick={() => inputRef.current?.click()}>Bild laden</Button>
            <Button type="button" variant="secondary" onClick={() => setDetections(seed)}>Lokale Erkennung</Button>
          </div>
        </div>
      </Card>
      <div className="grid gap-5">
        <Card className="p-5">
          <h2 className="font-semibold">Bildverbesserung</h2>
          <label className="mt-5 grid gap-2 text-sm">Kontrast <input type="range" min=".5" max="2" step=".1" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></label>
          <label className="mt-5 grid gap-2 text-sm">Helligkeit <input type="range" min=".5" max="1.8" step=".1" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} /></label>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Ergebnisse</h2><span className="rounded-[var(--radius-pill)] bg-surface-2 px-3 py-1 font-mono text-xs text-accent-2">On-Device Demo</span></div>
          {detections.length ? (
            <ul className="mt-5 space-y-3 p-0">
              {detections.map((item) => <li className="flex list-none justify-between border-b border-line pb-3 text-sm" key={item.label}><span>{item.label}</span><strong>{item.confidence}%</strong></li>)}
            </ul>
          ) : <p className="mt-5 text-sm text-muted">Starten Sie die lokale Erkennung, um simulierte Annotationen zu sehen.</p>}
        </Card>
      </div>
    </div>
  );
}
