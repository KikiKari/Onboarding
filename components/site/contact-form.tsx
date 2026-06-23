"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type State = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      setState("error");
      setMessage("Das Kontaktformular ist in dieser Frontend-Demo nicht mit einem öffentlichen Backend verbunden.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Anfrage fehlgeschlagen");
      setState("success");
      setMessage("Danke. Ihre Nachricht wurde erfolgreich validiert.");
      event.currentTarget.reset();
    } catch {
      setState("error");
      setMessage("Die API ist momentan nicht erreichbar. Bitte versuchen Sie es später erneut.");
    }
  }

  return (
    <form className="grid gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-md)]" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-medium">Name<input required name="name" minLength={2} maxLength={80} className="focus-ring rounded-[var(--radius-md)] border border-line-strong bg-bg px-4 py-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">E-Mail<input required name="email" type="email" maxLength={160} className="focus-ring rounded-[var(--radius-md)] border border-line-strong bg-bg px-4 py-3 font-normal" /></label>
      <label className="grid gap-2 text-sm font-medium">Nachricht<textarea required name="message" minLength={10} maxLength={2000} rows={5} className="focus-ring resize-y rounded-[var(--radius-md)] border border-line-strong bg-bg px-4 py-3 font-normal" /></label>
      <Button disabled={state === "sending"} type="submit">{state === "sending" ? "Wird gesendet …" : "Nachricht senden →"}</Button>
      <p className={`min-h-6 text-sm ${state === "error" ? "text-[var(--danger)]" : "text-[var(--success)]"}`} aria-live="polite">{message}</p>
    </form>
  );
}
