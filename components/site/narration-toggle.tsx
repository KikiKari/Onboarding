"use client";

import { useRef, useState } from "react";

export function NarrationToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  }

  return (
    <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] text-muted">
      <audio ref={audioRef} src="/audio/project-narration.mp3" onEnded={() => setPlaying(false)} preload="none" />
      <button className="focus-ring rounded-[var(--radius-pill)] bg-bg/70 px-3 py-2 backdrop-blur-md" onClick={toggle} type="button" aria-pressed={playing} aria-label="KI-Narration abspielen oder stoppen">
        {playing ? "AUS" : "AN"} <span aria-hidden="true">/</span> KI-STIMME
      </button>
    </div>
  );
}
