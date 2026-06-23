import { VisionCheckDemo } from "@/components/demos/vision-check-demo";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata = { title: "Vision-Check Demo" };

export default function VisionCheckPage() {
  return (
    <>
      <Header />
      <main>
        <Section className="pt-[var(--space-16)]">
          <Container>
            <Badge>Interaktive Demo</Badge>
            <h1 className="display mt-4 text-[clamp(3rem,7vw,5rem)]">Vision-Check</h1>
            <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink-2">Eine sichere React-Adaption des lokalen Beispiels. Bildverarbeitung und Annotationen bleiben im Browser; es werden keine API-Schlüssel abgefragt.</p>
            <div className="mt-10"><VisionCheckDemo /></div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
