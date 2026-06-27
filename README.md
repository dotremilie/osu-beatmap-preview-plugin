# osu-beatmap-preview-plugin

Cross-browser Manifest V3 extension popup for previewing osu! beatmaps.

The plugin consumes [`osu-beatmap-preview`](https://github.com/dotremilie/osu-beatmap-preview) for canvas rendering and owns browser-extension concerns such as active-tab detection, `.osu` fetching, playback controls, mod selection, and popup UI.

## Development

The plugin currently depends on a sibling checkout of the library:

```json
"osu-beatmap-preview": "file:../osu-beatmap-preview"
```

Build the library first:

```bash
cd ../osu-beatmap-preview
npm install
npm run build
```

Then install and run the plugin:

```bash
cd ../osu-beatmap-preview-plugin
npm install
npm run dev
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

## Release Packaging

For store uploads, switch the library dependency from the local file dependency to a published npm version:

```json
"osu-beatmap-preview": "^0.1.0"
```

Then run:

```bash
npm install
npm run build
```

Upload the generated `dist/` folder or a zip created from that folder according to the target browser store's requirements.
