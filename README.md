# osu-beatmap-preview-plugin

Cross-browser Manifest V3 extension popup for previewing osu! beatmaps.

The plugin consumes [`osu-beatmap-preview`](https://github.com/dotremilie/osu-beatmap-preview) for canvas rendering and owns browser-extension concerns such as active-tab detection, `.osu` fetching, playback controls, mod selection, and popup UI.

<img width="638" height="558" alt="osu-beatmap-preview-plugin" src="https://github.com/user-attachments/assets/44d974d8-a299-4dfe-a937-5f46b9e54dc0" />

## Development

Install and run the plugin:

```bash
npm install
npm run dev
```

To test an unpublished local version of the library, temporarily change the dependency in `package.json`:

```json
"osu-beatmap-preview": "file:../osu-beatmap-preview"
```

Build the local library before installing plugin dependencies:

```bash
cd ../osu-beatmap-preview
npm install
npm run build

cd ../osu-beatmap-preview-plugin
npm install
```

## Build

```bash
npm run build
```

The built extension is emitted to `dist/`.

## Load The Extension

### Chrome or Edge

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select this repo's `dist/` folder.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on**.
3. Select `dist/manifest.json`.

## Usage

Open an osu! beatmap page such as:

```text
https://osu.ppy.sh/beatmapsets/...#osu/...
```

Then open the extension popup. The plugin reads the active tab URL, extracts the beatmap id, fetches `https://osu.ppy.sh/osu/{beatmapId}`, and renders the beatmap through `osu-beatmap-preview`.
