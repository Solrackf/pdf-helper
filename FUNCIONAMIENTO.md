# PDF Helper — Documentación de Funcionamiento Actual

> Estado: **v1.0** · Última revisión: Junio 2026

---

## Descripción general

PDF Helper es una herramienta web **100% del lado del cliente** (sin backend) que permite extraer páginas específicas de uno o varios PDFs y descargarlos comprimidos. No se sube ningún archivo a ningún servidor.

---

## Stack tecnológico

| Recurso | Versión | Rol |
|---|---|---|
| HTML5 + CSS3 | — | Estructura y estilos base |
| Tailwind CSS (CDN) | `@4` browser build | Utilidades de diseño responsivo |
| PDF.js (CDN) | `3.11.174` | Leer/validar PDFs (obtener número de páginas) |
| PDF-lib.js (CDN) | `1.17.1` | Crear, copiar páginas y guardar PDFs |
| Vanilla JavaScript | ES2020 | Lógica de la aplicación |

---

## Arquitectura de archivos

```
pdf-helper/
├── index.html          # Único punto de entrada (SPA estático)
├── css/
│   └── style.css       # Estilos personalizados (drag-active, file-item, page-input…)
└── js/
    └── app.js          # Toda la lógica de la aplicación (~425 líneas)
```

---

## Flujo de usuario (paso a paso)

```
1. El usuario abre index.html en el navegador
        │
        ▼
2. Arrastra PDFs al dropZone  ──OR──  clic → fileInput (multiple)
        │
        ▼
3. handleFiles() — por cada archivo:
   ├─ Valida que sea application/pdf
   ├─ Lee el ArrayBuffer con file.arrayBuffer()
   ├─ Valida con pdfjsLib.getDocument() → obtiene numPages
   └─ Empuja objeto { name, data, totalPages, pagesToExtract } a uploadedFiles[]
        │
        ▼
4. renderFileList() muestra cada archivo con:
   ├─ Nombre del archivo
   └─ Input de texto editable con rango de páginas (default: "1-N")
        │
        ▼
5. Usuario edita rangos y elige nivel de compresión (low / medium / high)
        │
        ▼
6. processFiles() — por cada archivo en uploadedFiles[]:
   ├─ Carga el PDF con PDFLib.PDFDocument.load()
   ├─ Verifica que no esté encriptado
   ├─ parsePageRanges() → convierte el string de rangos a array de números
   ├─ copyPages() → copia las páginas seleccionadas al nuevo documento
   ├─ save() con opciones según nivel de compresión
   └─ downloadBlob() → descarga automática con sufijo "_recortado.pdf"
        │
        ▼
7. Barra de progreso se actualiza por archivo completado
   Notificación de éxito o error al finalizar
```

---

## Funcionalidades existentes

### ✅ Drag & Drop
- Zona de arrastre visual con cambio de estilo al detectar `dragover` (`drag-active`).
- Soporte para soltar múltiples archivos a la vez.

### ✅ Selección múltiple de archivos
- Input `<file multiple>` para elegir varios PDFs desde el explorador de archivos.
- Cada archivo se procesa y agrega independientemente a la lista.

### ✅ Validación de archivos
- Verifica MIME type `application/pdf`.
- Detecta PDFs dañados o protegidos con contraseña (encriptados) y muestra error.
- Valida que el buffer no esté vacío.

### ✅ Extracción de páginas por rango
- Cada archivo tiene su propio input con el rango editable.
- Sintaxis soportada: `1-5, 8, 11-13` (rangos y páginas individuales, separados por coma).
- Elimina duplicados y ordena las páginas antes de copiarlas.
- Validación: ignora páginas fuera del rango válido (< 1 o > totalPages).

### ✅ Compresión ajustable
Tres niveles de compresión usando las opciones de `PDFDocument.save()`:

| Nivel | `useObjectStreams` | `compress` | Resultado |
|---|---|---|---|
| `low` | `false` | `false` | Mayor calidad, archivo más grande |
| `medium` (default) | `true` | `true` | Equilibrado |
| `high` | `true` + `objectsPerTick: 50` | `true` | Archivo más pequeño |

### ✅ Descarga automática
- Genera un `Blob` de tipo `application/pdf`.
- Usa un `<a>` temporal con `click()` para disparar la descarga.
- Nombre de salida: `[nombre_original]_recortado.pdf`.

### ✅ Barra de progreso
- Se muestra durante la carga inicial y durante el procesamiento.
- Progreso calculado como `(archivos procesados / total) * 100`.

### ✅ Sistema de notificaciones
- Toast dinámico en la esquina inferior derecha.
- Cuatro tipos: `info` (azul), `success` (verde), `warning` (amarillo), `error` (rojo).
- Se elimina automáticamente a los 5 segundos o manualmente con el botón ✕.

### ✅ Verificación de dependencias
- `checkDependencies()` verifica que PDF.js y PDF-lib estén disponibles antes de cualquier operación.

---

## Limitaciones conocidas (v1.0)

| # | Limitación |
|---|---|
| 1 | No hay previsualización de páginas antes de procesar |
| 2 | No se puede reordenar ni eliminar archivos de la lista una vez añadidos |
| 3 | No hay botón para eliminar un archivo individual de la cola |
| 4 | La "compresión" es solo optimización de streams, no recompresión real de imágenes |
| 5 | No hay soporte para PDFs con contraseña |
| 6 | Sin modo oscuro |
| 7 | No persiste estado entre recargas (no usa localStorage ni IndexedDB) |
| 8 | Un solo listener `change` duplicado en `app.js` (líneas 36–56 y 72) |
| 9 | No hay indicador de tamaño de archivo antes/después |
| 10 | Sin soporte para unir (merge) múltiples PDFs en uno solo |

---

## Ideas de mejora para v2.0

- **Merge de PDFs**: unir varios archivos en un único PDF de salida.
- **Previsualización de páginas**: miniaturas de cada página usando PDF.js canvas.
- **Reordenar páginas**: drag & drop de páginas dentro de un PDF.
- **Eliminar archivos de la cola**: botón ✕ por archivo.
- **Progreso por página** (no solo por archivo).
- **Indicador de tamaño**: mostrar tamaño original vs. tamaño comprimido estimado.
- **Rotación de páginas**: rotar páginas individualmente (90°, 180°, 270°).
- **Modo oscuro**.
- **PWA**: Service Worker para uso offline.
- **Soporte para PDFs con contraseña** (si PDF-lib lo permite en el futuro).
