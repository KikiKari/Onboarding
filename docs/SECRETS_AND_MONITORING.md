# Secrets und Monitoring

Stand: 21. Juni 2026

## Verbindliche Ablage

- Echte Werte gehören ausschließlich in `.env` im Projektwurzelverzeichnis
  oder in den Secret Store der jeweiligen Deployment-Plattform.
- `.env` ist durch `.gitignore` und `.dockerignore` ausgeschlossen.
- `.env.example` enthält nur Namen und nicht-sensitive Standardwerte.
- Clientseitige Variablen dürfen nur mit `NEXT_PUBLIC_` beginnen, wenn ihr
  Inhalt ausdrücklich öffentlich sein darf.
- Provider-, Deployment- und Monitoring-Tokens dürfen niemals
  `NEXT_PUBLIC_` verwenden.

Next.js lädt `.env` automatisch. Lokale Node-Produktionsskripte lesen Werte
über `process.env`; FastAPI liest ausschließlich die Prozessumgebung.

## Protokollierung

Protokolliert werden dürfen:

- Variablenname
- Dienst und Operation
- Zeitpunkt
- Erfolg oder Fehlerklasse
- Anbieter-Request-ID
- Kosten beziehungsweise Creditverbrauch

Nicht protokolliert werden dürfen:

- der Wert selbst
- vollständige Authorization-Header
- Passphrasen
- Request-Bodies mit Zugangsdaten
- Screenshots von Key- oder Token-Seiten

Maskierte Kennungen dürfen höchstens die letzten vier Zeichen enthalten.

## Tagesstatus-Integration

Eine optionale Monitoring-Anbindung wird ausschließlich über
`TAGESSTATUS_AUDIT_ENDPOINT` und `TAGESSTATUS_AUDIT_TOKEN` konfiguriert. Fehlen
diese Variablen, bleibt die Anwendung funktionsfähig und protokolliert keine
sensitiven Inhalte.

Die Behauptung, ein externes Monitoring könne jede missbräuchliche Verwendung
eines bereits veröffentlichten Tokens zuverlässig verhindern, ist technisch
nicht ausreichend. Tokenrotation, minimale Berechtigungen, Ablaufzeiten und
anbieter­seitige Sperrung bleiben erforderlich.

## Reconciliation

Vor einer Provider-Operation:

1. erforderlichen Variablennamen prüfen;
2. keine Werte aus Chat, Markdown oder Screenshots übernehmen;
3. lokale `.env` oder einen Secret Store verwenden;
4. Kosten und Operation ausweisen;
5. Ergebnis ohne Geheimnisse protokollieren;
6. Secret-Scan ausführen.

## Offengelegte Werte

Alle in Chatverläufen, Screenshots oder Klartextdateien sichtbaren Tokens gelten
als offengelegt. Sie werden nicht in dieses Repository kopiert und sollten beim
jeweiligen Anbieter rotiert werden.
