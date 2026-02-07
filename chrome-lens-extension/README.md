# Project GREEN

A browser extension to detect and save clothing items from videos using drag-to-highlight selection.

## Features

- **Floating Bubble**: Always visible mint green bubble button (like Grammarly) to activate selection mode
- **Drag-to-Highlight**: Click and drag a rectangle over any area (especially videos) to select clothing items
- **Save Functionality**: Selected items are automatically saved to local storage
- **Sidebar**: Draggable, scrollable sidebar showing all saved items with remove functionality
- **Mint Green Theme**: Beautiful #98FF98 mint green color scheme throughout

## Tech Stack

- **React 18** - UI components
- **Tailwind CSS** - Styling with mint green theme
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Chrome Extension Manifest V3**

## Setup & Build

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys (Optional - for future vision features)

Edit `src/config/api-keys.ts` and add your Dedalus Labs API key if you want to add vision features later (e.g., analyzing/describing clothing items).

**Note**: This file is gitignored for security. The extension currently just saves images without analysis.

### 3. Build the Extension

```bash
npm run build
```

This will create a `dist/` folder with the compiled extension files.

### 4. Generate Icons

Open `generate-icons.html` in your browser and download the three icon sizes (16x16, 32x32, 48x48). Place them in the `icons/` folder.

Alternatively, create your own mint green (#98FF98) icons and place them as:
- `icons/icon16.png`
- `icons/icon32.png`
- `icons/icon48.png`

### 5. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome-lens-extension` folder (the one containing `manifest.json`)

## Development

For development with watch mode:

```bash
npm run dev
```

This will rebuild automatically when you make changes. After rebuilding, reload the extension in Chrome.

## Usage

1. Navigate to any webpage (especially one with videos)
2. Click the mint green floating bubble in the bottom-right corner
3. Click and drag to select an area (clothing item, accessory, etc.)
4. The selection is automatically saved and the sidebar will appear
5. View all saved items in the draggable sidebar
6. Remove items by clicking the "Remove" button

## Project Structure

```
chrome-lens-extension/
├── src/
│   ├── bubble/          # Floating bubble component
│   ├── sidebar/         # Sidebar component
│   ├── content/         # Main content script
│   ├── config/          # API keys configuration
│   └── styles/          # Global styles
├── icons/               # Extension icons
├── dist/                # Built files (generated)
├── background.js        # Background service worker
├── manifest.json        # Extension manifest
└── package.json         # Dependencies
```

## Permissions

- `activeTab` - To capture screenshots of the current tab
- `scripting` - To inject content scripts
- `storage` - To save items locally using `chrome.storage.local`
- `host_permissions` - For future vision API features

## License

MIT
