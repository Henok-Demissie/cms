#!/usr/bin/env node
/**
 * Regenerates public/qr.html with a QR code for the Expo Go dev server.
 *
 * The page is a static file served from Vercel, so it cannot discover the dev
 * machine's LAN address at request time -- the address has to be baked in when
 * the page is generated. That address changes whenever the host joins a
 * different network, which silently breaks the QR. This script re-detects it.
 *
 *   node scripts/generate-expo-qr.mjs                  # auto-detect host LAN IP
 *   node scripts/generate-expo-qr.mjs 172.25.207.248   # or pass one explicitly
 *
 * Requires WSL interop (powershell.exe) for auto-detection, since Metro listens
 * inside WSL but the phone connects to the Windows host's LAN address, which is
 * forwarded into WSL by netsh portproxy.
 */

import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const PORT = 8081
const OUT = new URL("../public/qr.html", import.meta.url)

/** Ask Windows for its IPv4 addresses, preferring the Wi-Fi adapter. */
function detectHostLanIp() {
  const ps =
    "Get-NetIPAddress -AddressFamily IPv4 | " +
    "Select-Object IPAddress,InterfaceAlias | ConvertTo-Json -Compress"

  let raw
  try {
    raw = execFileSync("powershell.exe", ["-NoProfile", "-Command", ps], {
      encoding: "utf8",
      timeout: 30_000,
    })
  } catch {
    throw new Error(
      "could not run powershell.exe to detect the host IP. Pass the address " +
        "explicitly: node scripts/generate-expo-qr.mjs <ip>",
    )
  }

  const parsed = JSON.parse(raw.replace(/^\uFEFF/, ""))
  const addresses = Array.isArray(parsed) ? parsed : [parsed]

  // Exclude anything the phone can never reach: loopback, link-local
  // autoconfiguration, and the virtual adapter Windows uses to talk to WSL.
  const reachable = addresses.filter(({ IPAddress: ip, InterfaceAlias: nic }) => {
    if (!ip || ip.startsWith("127.") || ip.startsWith("169.254.")) return false
    return !/^vEthernet/i.test(nic ?? "")
  })

  // The phone is on Wi-Fi, so that adapter's address is the one it can route to.
  const wifi = reachable.find((a) => /wi-?fi|wlan/i.test(a.InterfaceAlias ?? ""))
  const chosen = wifi ?? reachable[0]

  if (!chosen) throw new Error("host has no reachable LAN address -- is it online?")

  return { ip: chosen.IPAddress, nic: chosen.InterfaceAlias, candidates: reachable }
}

/** Render the QR as SVG using the `qrcode` CLI, fetched on demand via npx. */
function buildQrSvg(text) {
  const file = join(mkdtempSync(join(tmpdir(), "expo-qr-")), "qr.svg")
  execFileSync("npx", ["--yes", "qrcode", "-t", "svg", "-o", file, text], {
    stdio: ["ignore", "ignore", "inherit"],
    timeout: 180_000,
  })

  const svg = readFileSync(file, "utf8")
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1]
  const path = svg.match(/<path stroke="#0{6}" d="([^"]+)"\/>/)?.[1]
  if (!viewBox || !path) throw new Error("unexpected SVG from the qrcode CLI")

  // Re-emit rather than inlining the CLI's output: it ships an XML prolog and
  // DOCTYPE that do not belong inside an HTML document.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ` +
    `shape-rendering="crispEdges" role="img" aria-label="Expo Go QR code for ${text}">` +
    `<path fill="#fff" d="M0 0h${viewBox.split(" ")[2]}v${viewBox.split(" ")[3]}H0z"/>` +
    `<path stroke="#000" d="${path}"/>` +
    `</svg>`
  )
}

function renderPage({ url, ip, svg }) {
  const subnet = `${ip.split(".").slice(0, 3).join(".")}.x`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AbetBay — Expo Go QR</title>
<style>
  :root { color-scheme: dark; }
  body {
    margin: 0; min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; background: #061018; color: #e6f1f5;
    font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  h1 { margin: 0; font-size: 22px; color: #00d4aa; letter-spacing: .2px; }
  .card { background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,212,170,.25); }
  .card svg { display: block; width: min(396px, 78vmin); height: auto; }
  code { background: #0f2130; color: #00d4aa; padding: 8px 14px; border-radius: 8px; font-size: 15px; }
  ol { max-width: 30rem; margin: 0; padding-left: 1.4rem; color: #9fb3bd; font-size: 13.5px; }
  li { margin: 5px 0; }
  b { color: #cfe3ea; }
</style>
</head>
<body>
  <h1>Scan with Expo Go</h1>
  <div class="card">${svg}</div>
  <code>${url}</code>
  <ol>
    <li>Phone on the same Wi-Fi as this PC (<b>${subnet}</b>).</li>
    <li>Host port forwarding must be active, or the phone cannot reach WSL:
        run <b>C:\\Users\\HP\\wsl-expo-portproxy.ps1</b> in an admin PowerShell.</li>
    <li>Android: scan from inside <b>Expo Go</b>. iOS: use the Camera app.</li>
    <li>Nothing loads? Confirm Metro is up at <b>localhost:${PORT}</b>.</li>
    <li>This QR is baked in at build time. If the PC changes network, the
        address above goes stale — rerun <b>node scripts/generate-expo-qr.mjs</b>
        and redeploy.</li>
  </ol>
</body>
</html>
`
}

export { detectHostLanIp, PORT }

/** Resolve the dev-server address, honouring an explicit override. */
export function resolveExpoUrl(override) {
  const detected = override
    ? { ip: override, nic: "(supplied)", candidates: [] }
    : detectHostLanIp()
  return { ...detected, url: `exp://${detected.ip}:${PORT}` }
}

function main() {
  const { ip, nic, candidates, url } = resolveExpoUrl(process.argv[2])
  writeFileSync(OUT, renderPage({ url, ip, svg: buildQrSvg(url) }))

  console.log(`host LAN IP : ${ip}  (${nic})`)
  if (candidates.length > 1) {
    const others = candidates
      .filter((a) => a.IPAddress !== ip)
      .map((a) => `${a.IPAddress} (${a.InterfaceAlias})`)
      .join(", ")
    console.log(`not chosen  : ${others}`)
  }
  console.log(`encoded url : ${url}`)
  console.log(`wrote       : public/qr.html`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
}
