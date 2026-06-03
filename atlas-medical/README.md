# 💚 Morita PDF Helper

> Herramienta de productividad para gestión de documentos PDF — hecha con amor para Morita.

**Live:** [solrackf.github.io/pdf-helper](https://solrackf.github.io/pdf-helper/)

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| **Extraer páginas** | Selecciona páginas visualmente con miniaturas y descárgalas como PDF |
| **Unir documentos** | Combina múltiples PDFs con drag & drop para reordenar |
| **Dividir PDF** | Parte un PDF en secciones con rangos personalizados o división rápida |
| **Comprimir PDF** | Reduce el tamaño manteniendo la calidad |
| **PDF a imágenes** | Exporta cada página como PNG o JPG en hasta 3× de resolución |
| **Notas** | Bloc de apuntes con etiquetas, colores y búsqueda — persistido localmente |

## 🔒 Privacidad

**Todo el procesamiento ocurre en tu dispositivo.** Ningún archivo sale de tu navegador — no hay servidor, no hay uploads.

---

## 🛠 Stack técnico

- **React 19** + **TypeScript**
- **Vite 8** con `@tailwindcss/vite`
- **Tailwind CSS v4**
- **Framer Motion** — animaciones y transiciones
- **Zustand** — estado global con persistencia en `localStorage`
- **React Router v7**
- **pdfjs-dist** — renderizado de páginas PDF
- **pdf-lib** — manipulación y generación de PDFs
- **lucide-react** — iconografía
- **vite-plugin-pwa** — instalable como PWA

---

## 🎨 Diseño

- Paleta **Chateau Green** (50–950) como único sistema de color
- **Glassmorphism** con `backdrop-filter` en sidebar y cards
- Modo **claro** y **oscuro** con tokens semánticos CSS (`--bg-page`, `--text-primary`, etc.)
- Responsive: **bottom nav** en móvil, sidebar icon-only en tablet, sidebar completo en desktop
- Corazones flotantes animados en el fondo 💚

---

## 🚀 Desarrollo local

```bash
cd atlas-medical
npm install
npm run dev
# → http://localhost:5173/pdf-helper/
```

## 📦 Deploy

```bash
npm run deploy
# Build + push automático a rama gh-pages
```

---

*Hecho con 💚 para Morita*
