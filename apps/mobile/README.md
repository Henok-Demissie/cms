# AbetBay Mobile

Expo customer companion for the AbetBay complaint system. It uses the existing
Next.js API and supports distinct customer and staff sign-in entry points.

## Run

1. Start the web/API server from the repository root: `pnpm dev`
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` for your device.
3. From this folder run `pnpm start`, then open Expo Go or an emulator.

For a physical phone, `localhost` means the phone itself. Use the computer's
LAN IP and make sure the phone and computer are on the same network.
