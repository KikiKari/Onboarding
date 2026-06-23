"use client";

import { useState } from "react";

type ElementEntry = readonly [symbol: string, name: string, number: number, category: string];

const elements: ElementEntry[] = [
  ["H", "Wasserstoff", 1, "Nichtmetall"], ["He", "Helium", 2, "Edelgas"],
  ["Li", "Lithium", 3, "Alkalimetall"], ["Be", "Beryllium", 4, "Erdalkalimetall"],
  ["B", "Bor", 5, "Halbmetall"], ["C", "Kohlenstoff", 6, "Nichtmetall"],
  ["N", "Stickstoff", 7, "Nichtmetall"], ["O", "Sauerstoff", 8, "Nichtmetall"],
  ["F", "Fluor", 9, "Halogen"], ["Ne", "Neon", 10, "Edelgas"],
  ["Na", "Natrium", 11, "Alkalimetall"], ["Mg", "Magnesium", 12, "Erdalkalimetall"],
  ["Al", "Aluminium", 13, "Metall"], ["Si", "Silicium", 14, "Halbmetall"],
  ["P", "Phosphor", 15, "Nichtmetall"], ["S", "Schwefel", 16, "Nichtmetall"],
  ["Cl", "Chlor", 17, "Halogen"], ["Ar", "Argon", 18, "Edelgas"],
];

export function PeriodicTable() {
  const [selected, setSelected] = useState(elements[0]);
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {elements.map((element) => (
          <button className={`focus-ring aspect-square rounded-[var(--radius-md)] border p-2 text-left transition hover:-translate-y-1 ${selected[0] === element[0] ? "border-accent bg-accent-tint" : "border-line bg-surface"}`} key={element[0]} onClick={() => setSelected(element)}>
            <span className="font-mono text-xs text-muted">{element[2]}</span>
            <strong className="display block text-3xl">{element[0]}</strong>
            <span className="block truncate text-xs text-muted">{element[1]}</span>
          </button>
        ))}
      </div>
      <aside className="rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[var(--shadow-md)]">
        <span className="font-mono text-xs text-accent">ELEMENT {selected[2]}</span>
        <h2 className="display mt-4 text-5xl">{selected[0]}</h2>
        <p className="mt-2 text-xl">{selected[1]}</p>
        <p className="mt-5 text-sm text-muted">Kategorie: {selected[3]}</p>
      </aside>
    </div>
  );
}
