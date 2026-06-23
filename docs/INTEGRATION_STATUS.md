# Integrations- und Veröffentlichungsstatus

Stand: 22. Juni 2026

Dieses Dokument wird bei der abschließenden Synchronisierung mit Vercel,
Notion, Linear und Canva fortgeschrieben. Es enthält keine Secrets.

## Lokaler Stand

- Projekt: `Onboarding and Project Pages`
- Frontend: Next.js App Router, TypeScript, Tailwind-Tokens, Framer Motion
- Backend: FastAPI mit `GET /health` und `POST /api/contact`
- Lokaler Start: `docker compose up --build`
- Cowork-v3-Projektkontext übernommen
- Cowork-v3-Linkmatrix übernommen
- Cowork-Canva-Block übernommen und auf Klartext-Secrets geprüft

## Externe Ziele

| Ziel | Vorgang | Status |
|---|---|---|
| Vercel | Produktionsdeployment des Next.js-Frontends | abgeschlossen, `Ready` |
| Notion | neue Projektdokumentationsseite | abgeschlossen, Hauptseite + 5 Unterseiten |
| Linear | neues Projekt mit Projektdokument | abgeschlossen, Status `Completed` |
| Canva | Cowork-HTML als bevorzugte Arbeitsgrundlage prüfen und Design aktualisieren | Anmeldung/Code-Import offen |

## Externe Ergebnisse

- Vercel-Produktion:
  https://produkt-landingpage-3bb41d0a.vercel.app/
- Vercel-Deployment:
  `dpl_9Yd55VxqGhWGt1KHymEGy6FkUus1`
- Notion-Hauptseite:
  https://app.notion.com/p/3878d8ad3db98116a5d4f68d8c8ad717
- Linear-Projekt:
  https://linear.app/0penclaw/project/onboarding-and-project-pages-77bce25304c7/overview
- Linear-Projektdokument:
  https://linear.app/0penclaw/document/projektabschluss-and-integrationen-96f62f4c3646

## Notion-Unterseiten

- Architektur & Seitenstruktur
- Design, Animation & Medien
- Deployment & Betrieb
- Dokumentation & Quellen
- Sicherheit, Provider & Kosten

## Abnahme

- TypeScript: bestanden
- ESLint: bestanden
- Vitest: 2 Tests bestanden
- Pytest: 3 Tests bestanden
- Secret-Scan: bestanden
- Next.js-Produktionsbuild: 15 Seiten
- Vercel: `Ready`, Produktionsalias aktiv
- Docker: Backend `healthy`, Frontend `running`

## Lokaler Cache-Hinweis

Die beiden ignorierten `.pytest_cache`-Verzeichnisse besitzen eine defekte
Windows-ACL. Löschen und Besitzübernahme wurden trotz Freigabe durch Windows
verweigert. Sie sind in ESLint, Git, Docker und Vercel ausgeschlossen und
beeinträchtigen Build oder Deployment nicht.

## Quellen

- `docs/PROJECT_CONTEXT_CLAUDE_COWORK.md`
- `docs/LINKS_AND_REACHABILITY.md`
- `docs/appendix/claude-cowork/`
- `docs/SOURCES.md`
