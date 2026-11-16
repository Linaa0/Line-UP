# Line-Up — Mobile

React Native app built with Expo (SDK 58) and Expo Router. See the root
[README](../README.md) and [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

```bash
npm install
cp .env.example .env.local
npm start            # opens Expo Dev Tools; scan the QR code with Expo Go
```

| Script              | Purpose                                         |
| ------------------- | ----------------------------------------------- |
| `npm start`         | Start the Metro dev server (Expo Go / dev build) |
| `npm run android`   | Open on an Android emulator / device             |
| `npm run ios`       | Open on the iOS simulator (macOS only)           |
| `npm run web`       | Preview in a browser on port 3003                |
| `npm run lint`      | ESLint (expo config)                             |
| `npm run typecheck` | TypeScript check                                 |

Add packages with `npx expo install <package>` so versions match the SDK.
