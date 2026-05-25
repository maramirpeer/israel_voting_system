param(
  [Parameter(Mandatory = $true)]
  [string]$OldText,

  [Parameter(Mandatory = $true)]
  [string]$NewText,

  [string]$CommitMessage = "Update live text",
  [string]$Server = "root@167.71.67.62",
  [string]$KeyPath = "$HOME\.ssh\sharedemocracy_deploy",
  [string]$App = "c44m6uqj3q71e8psn9rlzg0i"
)

$ErrorActionPreference = "Stop"

function Run($Command) {
  Write-Host "==> $Command"
  & powershell -NoProfile -Command $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $Command"
  }
}

$repoRoot = (& git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

$paths = @("client", "server", "shared")
$extensions = @(".ts", ".tsx", ".js", ".jsx", ".html", ".json", ".md", ".css")
$changedFiles = New-Object System.Collections.Generic.List[string]

foreach ($path in $paths) {
  if (!(Test-Path $path)) { continue }
  Get-ChildItem $path -Recurse -File | ForEach-Object {
    if ($extensions -notcontains $_.Extension) { return }
    $content = Get-Content -LiteralPath $_.FullName -Raw -Encoding UTF8
    if ($content.Contains($OldText)) {
      $content.Replace($OldText, $NewText) | Set-Content -LiteralPath $_.FullName -NoNewline -Encoding UTF8
      $changedFiles.Add($_.FullName)
    }
  }
}

if ($changedFiles.Count -eq 0) {
  throw "No local files contained the requested old text."
}

git add -- $changedFiles
git commit -m $CommitMessage
git push origin main

$commit = (& git rev-parse HEAD).Trim()
$oldBytes = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($OldText))
$newBytes = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($NewText))

$remoteScript = @"
set -e
APP="$App"
COMMIT="$commit"
OLD_B64="$oldBytes"
NEW_B64="$newBytes"
CONTAINER=`$(docker ps --filter "label=coolify.name=`$APP" --format '{{.ID}}' | head -1)
if [ -z "`$CONTAINER" ]; then
  echo "Could not find running container for `$APP" >&2
  exit 1
fi

docker exec -i -e OLD_B64="`$OLD_B64" -e NEW_B64="`$NEW_B64" "`$CONTAINER" node <<'NODE'
const fs = require("fs");
const path = require("path");
const oldText = Buffer.from(process.env.OLD_B64, "base64").toString("utf8");
const newText = Buffer.from(process.env.NEW_B64, "base64").toString("utf8");
const roots = ["/app/client", "/app/server", "/app/shared", "/app/dist/public"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".html", ".json", ".md", ".css"]);
const changed = [];
function visit(filePath) {
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(filePath)) visit(path.join(filePath, child));
    return;
  }
  if (!extensions.has(path.extname(filePath))) return;
  let text = fs.readFileSync(filePath, "utf8");
  if (!text.includes(oldText)) return;
  text = text.split(oldText).join(newText);
  fs.writeFileSync(filePath, text);
  changed.push(filePath);
}
for (const root of roots) {
  if (fs.existsSync(root)) visit(root);
}
console.log(JSON.stringify(changed, null, 2));
if (!changed.length) process.exit(1);
NODE

docker commit "`$CONTAINER" "`$APP:`$COMMIT" >/tmp/sharedemocracy_commit.out
sed -i "s/^SOURCE_COMMIT=.*/SOURCE_COMMIT=`$COMMIT/" "/data/coolify/applications/`$APP/.env"
sed -i -E "s#image: '`$APP:[^']+'#image: '`$APP:`$COMMIT'#" "/data/coolify/applications/`$APP/docker-compose.yaml"
cd "/data/coolify/applications/`$APP"
docker compose up -d
cat /tmp/sharedemocracy_commit.out
"@

$remoteScript | ssh -i $KeyPath -o BatchMode=yes $Server "OLD_B64='$oldBytes' NEW_B64='$newBytes' bash -s"
if ($LASTEXITCODE -ne 0) {
  throw "Remote live update failed."
}

Write-Host "Done. Updated live site at commit $commit"
