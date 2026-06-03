<div align="center">

# 💚 Morita PDF Helper

**A privacy-first, client-side PDF productivity suite built for medical professionals.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-solrackf.github.io-1bcc61?style=for-the-badge&logo=github)](https://solrackf.github.io/pdf-helper/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-installable-1bcc61?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?style=for-the-badge&logo=github-pages)](https://pages.github.com)

</div>

---

## Overview

**Morita PDF Helper** is a fully client-side web application that provides a comprehensive suite of PDF manipulation and productivity tools. Every operation — from splitting documents to rendering page thumbnails — executes entirely in the user's browser using WebAssembly-powered libraries. **Zero data ever leaves the device.**

Designed for a medical professional who handles large volumes of documents daily, the app prioritizes a frictionless workflow: drag a file in, get the result out, no account required.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MORITA PDF HELPER                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PDF Engine  │  │  UI Layer    │  │  State & Persistence │  │
│  │              │  │              │  │                      │  │
│  │  pdfjs-dist  │  │  React 19    │  │  Zustand + persist   │  │
│  │  (WASM)      │  │  + Framer    │  │  localStorage        │  │
│  │              │  │  Motion      │  │                      │  │
│  │  pdf-lib     │  │  Tailwind v4 │  │  Notes, settings,    │  │
│  │  (pure JS)   │  │  + CSS vars  │  │  dark mode           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ✓ No server  ✓ No uploads  ✓ No accounts  ✓ Offline-ready     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### 📄 PDF Modules

| Module | Description | Key Tech |
|---|---|---|
| **Extract Pages** | Visual thumbnail grid — select individual pages or ranges and download as a new PDF | `pdfjs-dist` canvas rendering |
| **Merge Documents** | Combine unlimited PDFs with drag-and-drop reordering before generating | `pdf-lib` document merging |
| **Split PDF** | Divide a PDF into named sections by custom page ranges, or auto-split into equal parts | `pdf-lib` page extraction |
| **Compress PDF** | Three compression levels (light / balanced / max) with real-time size estimation | `pdf-lib` re-serialization |
| **PDF to Images** | Export every page as PNG or JPG at 1×, 2× (144 dpi), or 3× (216 dpi) resolution | `pdfjs-dist` + HTML5 Canvas |

### 📝 Productivity

| Module | Description |
|---|---|
| **Notes** | Full-featured notepad with 6 color themes, 6 subject tags (Anatomy, Pharmacology, Clinical, etc.), full-text search, word/character count — all persisted in `localStorage` |

---

## Architecture

### Technology Stack

```
Frontend Framework   React 19 (concurrent features, automatic batching)
Language             TypeScript 6.0 (strict mode)
Build Tool           Vite 8 + Rolldown bundler
Styling              Tailwind CSS v4 (@tailwindcss/vite plugin, zero config)
Animations           Framer Motion 12 (layout animations, spring physics)
State Management     Zustand 5 (with persist middleware → localStorage)
Routing              React Router v7 (data router)
PDF Rendering        pdfjs-dist 6.0 (WebAssembly worker)
PDF Generation       pdf-lib 1.17 (pure JavaScript, no WASM)
Icons                lucide-react 1.17
PWA                  vite-plugin-pwa 1.3 (Workbox, generateSW strategy)
Deploy               gh-pages → GitHub Pages
```

### Project Structure

```
atlas-medical/
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Root layout: orbs, floating hearts, page transitions
│   │   ├── Sidebar.tsx         # Responsive: full (lg) / icon-only (md) / bottom nav (sm)
│   │   ├── DropZone.tsx        # Accessible drag-and-drop (ARIA, keyboard nav)
│   │   ├── HeartProgress.tsx   # Animated progress bar with travelling heart indicator
│   │   └── PageHeader.tsx      # Consistent page title component
│   ├── pages/
│   │   ├── Dashboard.tsx       # Dark-aware hero banner, 6-tool grid
│   │   ├── Extract.tsx         # Thumbnail grid + page selection
│   │   ├── Merge.tsx           # Drag-to-reorder file list
│   │   ├── Split.tsx           # Dynamic range editor
│   │   ├── Compress.tsx        # Compression level selector
│   │   ├── Convert.tsx         # Format + resolution picker
│   │   └── Notes.tsx           # Tag-filtered notepad
│   ├── store/
│   │   └── useStore.ts         # Zustand store (darkMode, extractFiles, mergeFiles)
│   ├── lib/
│   │   └── pdfUtils.ts         # loadPdf, renderPageThumbnail, renderPageFull,
│   │                           # extractPages, mergeDocuments, downloadBytes
│   ├── context/
│   │   └── ToastContext.tsx    # Global toast notification system
│   ├── App.tsx                 # Route definitions
│   └── index.css               # Design tokens, glassmorphism, animations
├── index.html                  # Skip-to-content link, Google Fonts
├── vite.config.ts              # Vite + PWA + manual chunk splitting
└── package.json
```

### Design System

The entire visual language derives from a single **Chateau Green** palette:

```
Token          Light mode          Dark mode
──────────────────────────────────────────────────────
--bg-page      #effef4 (cg-50)    #033017 (cg-950)
--text-primary #033017 (cg-950)   #effef4 (cg-50)
--text-secondary #0a6b30          #81f4ae (cg-300)
--surface      rgba(255,255,255,0.78)  rgba(5,28,16,0.82)
--border       rgba(129,244,174,0.45)  rgba(27,204,97,0.22)
```

Glassmorphism cards use `backdrop-filter: blur(18px) saturate(160%)` with mode-aware surface tokens. No hardcoded color values outside of `index.css`.

---

## Responsive Design

```
Breakpoint    Layout
──────────────────────────────────────────────────
< 768px       Bottom tab bar (4 pinned) + "More" drawer (slide-up sheet)
768–1023px    Icon-only sidebar (16px wide, tooltips on hover)
≥ 1024px      Full sidebar (256px) with labels and section groups
≥ 1440px      Content max-w-5xl centered — comfortable at 4K
```

Sidebar collapse is driven by a `useMediaQuery` hook using `useSyncExternalStore` for SSR-safe reactivity.

---

## Performance

| Metric | Value |
|---|---|
| JS bundle (app code, gzipped) | ~16 KB |
| CSS (gzipped) | ~7.5 KB |
| PDF engine (WASM, cached by SW) | ~1.25 MB |
| Lighthouse PWA score | ✅ Installable |
| Offline support | ✅ Workbox precache |
| `prefers-reduced-motion` | ✅ All animations disabled |

PDF processing chunks are code-split into a separate `pdf-vendor` bundle. The WASM worker runs off the main thread — UI never blocks during PDF operations.

---

## Accessibility

- **Keyboard navigation** — `DropZone` responds to `Enter` / `Space`
- **ARIA labels** — all interactive regions labeled (`nav`, `main`, dropzone, dark mode toggle)
- **Skip link** — `Ir al contenido principal` appears on focus for screen readers
- **Focus ring** — global `:focus-visible` with `var(--cg-500)` outline
- **Reduced motion** — `@media (prefers-reduced-motion: reduce)` disables all CSS animations
- **Color contrast** — text tokens meet WCAG AA in both light and dark modes

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Local Development

```bash
git clone https://github.com/Solrackf/pdf-helper.git
cd pdf-helper/atlas-medical
npm install
npm run dev
# → http://localhost:5173/pdf-helper/
```

### Production Build

```bash
npm run build
# Output: dist/ (~2.5 MB total, ~450 KB gzipped)
```

### Deploy to GitHub Pages

```bash
npm run deploy
# Runs: tsc -b && vite build && gh-pages -d dist
# Publishes to: gh-pages branch → https://solrackf.github.io/pdf-helper/
```

---

## Privacy Guarantee

```
User Device
    │
    ▼
Browser (JavaScript + WebAssembly)
    │
    ├── pdfjs-dist   → renders pages to Canvas (in-memory)
    ├── pdf-lib      → manipulates PDF bytes (in-memory ArrayBuffer)
    └── Blob URL     → triggers download directly to user's filesystem
         │
         ✗  No network request
         ✗  No server
         ✗  No analytics
         ✗  No cookies
```

All file data lives exclusively in the browser's memory for the duration of the session. Notes are stored in `localStorage` — never transmitted.

---

## License

MIT © 2025 — built with 💚 for Morita
