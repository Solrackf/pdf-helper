import * as pdfjs from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// ── PDF load options safe for large/complex medical PDFs ──────────────────────
const PDF_LIB_OPTS = {
  ignoreEncryption: false,
  throwOnInvalidObject: false,  // tolerate minor corruption in scanned docs
  updateMetadata: false,        // skip metadata rewrite → faster load
}

// ── loadPdf: ALWAYS copy before handing to pdfjs worker ──────────────────────
// pdfjs may detach/transfer the underlying ArrayBuffer to its worker.
// We copy here so the original `buffer` passed by the caller stays intact
// and can be safely used afterwards for extractPages / renderAllThumbnails.
export async function loadPdf(buffer: ArrayBuffer) {
  const copy = buffer.slice(0)   // own copy — pdfjs can do whatever it wants with this
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(copy),
    disableAutoFetch: true,
    disableStream: false,
  }).promise
  const numPages = pdf.numPages
  pdf.cleanup()
  return { numPages }
}

// ── renderAllThumbnails: opens PDF once, renders up to maxPages, destroys ─────
export async function renderAllThumbnails(
  buffer: ArrayBuffer,
  maxPages: number,
  scale = 0.3,
  onPage?: (num: number, src: string) => void
): Promise<Array<{ num: number; src: string }>> {
  const copy = buffer.slice(0)
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(copy),
    disableAutoFetch: true,
    disableStream: false,
  }).promise
  const total = Math.min(pdf.numPages, maxPages)
  const results: Array<{ num: number; src: string }> = []

  for (let i = 1; i <= total; i++) {
    try {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport, canvas }).promise
      const src = canvas.toDataURL('image/jpeg', 0.65)
      results.push({ num: i, src })
      onPage?.(i, src)
      page.cleanup()
      // release canvas memory explicitly
      canvas.width = 0
      canvas.height = 0
    } catch {
      results.push({ num: i, src: '' })
    }
  }
  pdf.cleanup()
  return results
}

// ── renderPageFull: for Convert module, one page at a time ───────────────────
export async function renderPageFull(
  buffer: ArrayBuffer,
  pageNum: number,
  scale = 2.0,
  format: 'png' | 'jpg' = 'png'
): Promise<string> {
  const copy = buffer.slice(0)
  const pdf = await pdfjs.getDocument({
    data: new Uint8Array(copy),
    disableAutoFetch: true,
    disableStream: false,
  }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(viewport.width)
  canvas.height = Math.round(viewport.height)
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  const result = format === 'jpg'
    ? canvas.toDataURL('image/jpeg', 0.92)
    : canvas.toDataURL('image/png')
  page.cleanup()
  canvas.width = 0; canvas.height = 0
  pdf.cleanup()
  return result
}

// ── parsePageRanges ───────────────────────────────────────────────────────────
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: number[] = []
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean)
  for (const part of parts) {
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number)
      if (!isNaN(s) && !isNaN(e) && s >= 1 && e <= totalPages && s <= e) {
        for (let i = s; i <= e; i++) pages.push(i)
      }
    } else {
      const n = Number(part)
      if (!isNaN(n) && n >= 1 && n <= totalPages) pages.push(n)
    }
  }
  return [...new Set(pages)].sort((a, b) => a - b)
}

// ── extractPages: chunked copy for large PDFs ─────────────────────────────────
// pdf-lib loads the entire doc in RAM. For 4000-page PDFs we copy in batches
// to avoid a single blocking synchronous operation freezing the UI.
const CHUNK = 50

export async function extractPages(
  buffer: ArrayBuffer,
  pages: number[],
  compression: 'low' | 'medium' | 'high'
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, PDF_LIB_OPTS)
  if (doc.isEncrypted) throw new Error('El documento está protegido con contraseña.')
  const newDoc = await PDFDocument.create()

  for (let i = 0; i < pages.length; i += CHUNK) {
    const batch = pages.slice(i, i + CHUNK).map((p) => p - 1)
    const copied = await newDoc.copyPages(doc, batch)
    copied.forEach((p) => newDoc.addPage(p))
    // yield to event loop between chunks so UI stays responsive
    await new Promise<void>((r) => setTimeout(r, 0))
  }

  return newDoc.save({ useObjectStreams: compression !== 'low' })
}

// ── mergeDocuments: sequential load+copy+destroy per doc ─────────────────────
export async function mergeDocuments(
  buffers: ArrayBuffer[],
  compression: 'low' | 'medium' | 'high'
): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf, PDF_LIB_OPTS)
    const indices = doc.getPageIndices()
    // copy in chunks to avoid blocking
    for (let i = 0; i < indices.length; i += CHUNK) {
      const batch = indices.slice(i, i + CHUNK)
      const pages = await merged.copyPages(doc, batch)
      pages.forEach((p) => merged.addPage(p))
      await new Promise<void>((r) => setTimeout(r, 0))
    }
  }
  return merged.save({ useObjectStreams: compression !== 'low' })
}

// ── downloadBytes: fix potential partial-buffer view bug ──────────────────────
export function downloadBytes(bytes: Uint8Array, fileName: string) {
  // Copy into a plain ArrayBuffer (avoids SharedArrayBuffer type issues + ensures exact byte range)
  const plain = new Uint8Array(bytes).buffer as ArrayBuffer
  const blob = new Blob([plain], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
