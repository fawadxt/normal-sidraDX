# Sidra Wallet — Mobile, PWA & APK Guide

## Project structure (mobile layer)

```
├── capacitor.config.ts          # Capacitor app id, splash, keyboard
├── public/
│   ├── manifest.webmanifest     # PWA manifest (standalone)
│   └── pwa-icon.svg             # App icon (PWA + apple-touch)
├── index.html                   # Splash screen + mobile meta tags
├── vite.config.ts               # PWA service worker (vite-plugin-pwa)
└── src/
    ├── components/
    │   ├── MobileRouter.tsx     # BrowserRouter (web) / HashRouter (native)
    │   └── wallet/
    │       ├── BottomNav.tsx    # Fixed bottom navigation
    │       └── InstallPrompt.tsx
    ├── hooks/
    │   ├── useVisualViewport.ts # Keyboard / viewport jump prevention
    │   └── useInstallPrompt.ts
    ├── layouts/WalletLayout.tsx # Safe areas + fixed nav shell
    └── lib/
        ├── nativeShell.ts       # Capacitor init, deep links, back button
        └── platform.ts          # isNativePlatform, standalone PWA
```

## Mobile features

| Feature | Implementation |
|---------|----------------|
| Max width | `max-w-md` (28rem) centered |
| Safe areas | `env(safe-area-inset-*)` + `.pt-safe` / `.pb-safe` |
| Fixed bottom nav | `.wallet-bottom-nav-fixed` |
| Touch targets | `.tap-target` (min 44×44px) |
| No horizontal scroll | `overflow-x: hidden` on html/body/shell |
| Keyboard | `font-size: 16px` inputs + `useVisualViewport` |
| Reduced motion | `prefers-reduced-motion` CSS |

## Commands

### Install dependencies

```bash
npm install
```

### Development (web + API)

```bash
npm run dev
```

Open `http://localhost:5173` — use Chrome DevTools mobile emulation (320–430px).

### Production build (PWA + Capacitor web assets)

```bash
npm run build
```

Same as:

```bash
npm run export
```

Output: `dist/` (used by Vercel and Capacitor).

### Preview production build

```bash
npm run preview
```

---

## PWA install (browser)

1. Run `npm run build && npm run preview`
2. Open in Chrome (Android) or Safari (iOS)
3. Use **Install** banner or browser menu → **Add to Home Screen**
4. App opens in **standalone** mode with offline shell caching

---

## Android APK (Capacitor)

Run once (if `android/` folder does not exist yet):

```bash
npm install
npm run export
npx cap init "Sidra Wallet" com.sidra.wallet --web-dir dist
```

> Skip `cap init` if `capacitor.config.ts` already exists (this repo includes it).

Add Android platform:

```bash
npx cap add android
```

After every web build:

```bash
npm run export
npx cap sync
```

Open in Android Studio:

```bash
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

### NPM shortcuts

```bash
npm run cap:sync
npm run cap:android   # first time only
npm run cap:open
```

## App identity

| Field | Value |
|-------|--------|
| App name | SidraWallet |
| App ID | `com.sidra.wallet` |
| Theme color | `#D4AF37` |
| Background | `#FAFAFA` |

---

## Share APK on your existing website (SidraDX link)

Users who open your **same Vercel link** in Chrome on Android will see a **Download APK** banner on the home screen.

### Option A — Google Drive (recommended for you)

1. Build the APK (see below).
2. Upload `fa-wallet.apk` to [Google Drive](https://drive.google.com).
3. Right-click → **Share** → **Anyone with the link** → **Viewer**.
4. Copy the share link, e.g.  
   `https://drive.google.com/file/d/1ABCxyz.../view?usp=sharing`
5. In **Vercel → Project → Settings → Environment Variables**, add:

   | Name | Value |
   |------|--------|
   | `VITE_APK_DOWNLOAD_URL` | Your Google Drive share link |
   | `VITE_APP_URL` | `https://your-site.vercel.app` |
   | `VITE_API_URL` | `https://your-site.vercel.app` |

6. **Redeploy** the project (env vars are baked in at build time).

The app converts Drive links to a direct download automatically.

### Option B — Same website (no Drive)

Copy the built APK to:

```
public/downloads/fa-wallet.apk
```

Then redeploy. Users download from `https://your-site.vercel.app/downloads/fa-wallet.apk`.

---

## Build APK on Windows (Android Studio installed)

```powershell
cd "c:\Normal SidraDX"

# First time only
npm install
npm run icons:android
npx cap add android

# Set Java + Android SDK for this session
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# Production API URL — replace with YOUR Vercel URL
$env:VITE_APP_URL = "https://your-site.vercel.app"
$env:VITE_API_URL = "https://your-site.vercel.app"

npm run apk:debug
```

Output APK:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Rename to `fa-wallet.apk`, upload to Drive, set `VITE_APK_DOWNLOAD_URL`, redeploy.

---

Register URL scheme in Android/iOS after `cap add android`:

- Example: `sidrawallet://swap` → routes via `appUrlOpen` in `nativeShell.ts`

## Notes

- **Web deploy**: Vercel rewrites SPA routes; no change needed.
- **Native**: Uses **HashRouter** automatically when running inside Capacitor.
- **WalletConnect / MetaMask**: Work in WebView; test on real device before store release.
- Replace `public/pwa-icon.svg` with PNG 192/512 before Play Store if required.
