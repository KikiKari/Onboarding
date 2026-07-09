<#
.SYNOPSIS
  Hält den lokalen Dev-Stack (docker-compose.dev.yml) inkrementell mit GitHub synchron.

.DESCRIPTION
  Pollt origin/<Branch> und zieht neue Commits per Fast-Forward. Danach entscheidet
  der Diff, was nötig ist:
    - nur Quellcode geändert            -> nichts tun, Hot-Reload übernimmt
    - package.json / package-lock.json  -> Frontend-Container neu starten
                                           (Entrypoint installiert Dependencies nur
                                           bei geändertem Lockfile-Hash nach)
    - backend/Dockerfile, requirements* -> Backend-Image gezielt neu bauen
    - docker-compose.dev.yml            -> Dev-Stack neu erzeugen
  Es wird nie „blind" der ganze Branch neu gebaut.

.EXAMPLE
  pwsh -File scripts/sync-local.ps1                # Dauerbetrieb, 20-s-Intervall
  pwsh -File scripts/sync-local.ps1 -Once          # genau ein Sync-Durchlauf
  pwsh -File scripts/sync-local.ps1 -Branch main   # anderen Branch verfolgen
#>
param(
  [string]$Branch = "claude/onboarding-persistent-sandbox-vjfmcx",
  [int]$IntervalSeconds = 20,
  [string]$ComposeFile = "docker-compose.dev.yml",
  [switch]$Once
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Log([string]$msg) {
  Write-Host ("[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $msg)
}

function Invoke-Compose([string[]]$composeArgs) {
  & docker compose -f $ComposeFile @composeArgs
  if ($LASTEXITCODE -ne 0) { Log "WARNUNG: docker compose $($composeArgs -join ' ') fehlgeschlagen (Exit $LASTEXITCODE)" }
}

# Sicherstellen, dass der Ziel-Branch ausgecheckt ist.
$current = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($current -ne $Branch) {
  Log "Wechsle von '$current' auf '$Branch' …"
  & git fetch origin $Branch
  & git switch $Branch 2>$null
  if ($LASTEXITCODE -ne 0) { & git switch -c $Branch --track "origin/$Branch" }
  if ($LASTEXITCODE -ne 0) { throw "Branch '$Branch' konnte nicht ausgecheckt werden." }
}

Log "Sync aktiv: origin/$Branch -> $repoRoot (Intervall ${IntervalSeconds}s, Compose: $ComposeFile)"

while ($true) {
  & git fetch origin $Branch --quiet
  if ($LASTEXITCODE -ne 0) {
    Log "Fetch fehlgeschlagen (Netzwerk?) — nächster Versuch in ${IntervalSeconds}s"
  }
  else {
    $local = (& git rev-parse HEAD).Trim()
    $remote = (& git rev-parse "origin/$Branch").Trim()

    if ($local -ne $remote) {
      & git merge-base --is-ancestor $local $remote
      if ($LASTEXITCODE -ne 0) {
        Log "ACHTUNG: Lokaler Stand ist von origin/$Branch abgewichen (lokale Commits?). Kein automatischer Merge — bitte manuell auflösen."
      }
      else {
        $changed = & git diff --name-only "$local..$remote"
        & git merge --ff-only $remote --quiet
        Log ("Aktualisiert {0} -> {1} ({2} Datei(en))" -f $local.Substring(0, 7), $remote.Substring(0, 7), $changed.Count)

        $frontendDeps = $changed | Where-Object { $_ -in @("package.json", "package-lock.json") }
        $backendImage = $changed | Where-Object { $_ -match "^backend/(Dockerfile|requirements.*\.txt)$" }
        $composeChanged = $changed | Where-Object { $_ -eq $ComposeFile }

        if ($composeChanged) {
          Log "Compose-Datei geändert — erzeuge Dev-Stack neu …"
          Invoke-Compose @("up", "-d")
        }
        if ($backendImage) {
          Log "Backend-Dependencies/Dockerfile geändert — baue nur das Backend neu …"
          Invoke-Compose @("up", "-d", "--build", "backend")
        }
        if ($frontendDeps) {
          Log "Frontend-Dependencies geändert — starte Frontend neu (npm install läuft im Container) …"
          Invoke-Compose @("restart", "frontend")
        }
        if (-not ($composeChanged -or $backendImage -or $frontendDeps)) {
          Log "Nur Quellcode/Assets — Hot-Reload übernimmt, kein Build nötig."
        }
      }
    }
  }

  if ($Once) { break }
  Start-Sleep -Seconds $IntervalSeconds
}
