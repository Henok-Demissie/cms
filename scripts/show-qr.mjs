#!/usr/bin/env node
/**
 * Prints the Expo Go QR code in the terminal, for scanning without a browser.
 *
 * Two things this fixes over hardcoding the address: it is detected at run time
 * (see generate-expo-qr.mjs), so it stays correct when the host changes network,
 * and the QR is rendered by the `qrcode` CLI fetched on demand via npx, so the
 * repo carries no extra dependency for a dev-only convenience.
 *
 *   node scripts/show-qr.mjs                  # auto-detect host LAN IP
 *   node scripts/show-qr.mjs 172.25.207.248   # or pass one explicitly
 */

import { execFileSync } from "node:child_process"
import { resolveExpoUrl } from "./generate-expo-qr.mjs"

const { ip, nic, url } = resolveExpoUrl(process.argv[2])
const subnet = `${ip.split(".").slice(0, 3).join(".")}.x`

console.log("\n========================================================")
console.log(`📱 EXPO GO QR CODE (${url})`)
console.log(`   host adapter: ${nic}`)
console.log("========================================================\n")

// --small halves the row count so the whole symbol fits on one screen; a QR
// scrolled off the top of the terminal cannot be scanned.
execFileSync("npx", ["--yes", "qrcode", "--small", url], {
  stdio: ["ignore", "inherit", "inherit"],
  timeout: 180_000,
})

console.log(`\n1. Ensure your mobile device is on the same Wi-Fi (${subnet}).`)
console.log("2. Open Expo Go on your phone and scan the QR code above.")
console.log("3. Metro must be running: pnpm mobile:start")
console.log("========================================================\n")
