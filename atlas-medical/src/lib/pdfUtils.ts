import * as pdfjs from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export async function loadPdf(buffer: ArrayBuffer) {
  const copy = buffer.slice(0)
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(copy) }).promise
  return { numPages: pdf.numPages }
}

export async function renderPageFull(
  buffer: ArrayBuffer,
  pageNum: number,
  scale = 2.0,
  format: 'png' | 'jpg' = 'png'
): Promise<string> {
  const copy = buffer.slice(0)
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(copy) }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return format === 'jpg'
    ? canvas.toDataURL('image/jpeg', 0.92)
    : canvas.toDataURL('image/png')
}

export async function renderPageThumbnail(
  buffer: ArrayBuffer,
  pageNum: number,
  scale = 0.3
): Promise<string> {
  const copy = buffer.slice(0)
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(copy) }).promise
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return canvas.toDataURL('image/jpeg', 0.7)
}

export async function renderAllThumbnails(
  buffer: ArrayBuffer,
  maxPages: number,
  scale = 0.3,
  onPage?: (num: number, src: string) => void
): Promise<Array<{ num: number; src: string }>> {
  const copy = buffer.slice(0)
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(copy) }).promise
  const total = Math.min(pdf.numPages, maxPages)
  const results: Array<{ num: number; src: string }> = []

  for (let i = 1; i <= total; i++) {
    try {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvasContext: ctx, viewport, canvas }).promise
      const src = canvas.toDataURL('image/jpeg', 0.7)
      results.push({ num: i, src })
      onPage?.(i, src)
      page.cleanup()
    } catch {
      results.push({ num: i, src: '' })
    }
  }
  return results
}

export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages: number[] = []
  const parts = rangeStr.split(',').map((p) => p.trim())
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

export async function extractPages(
  buffer: ArrayBuffer,
  pages: number[],
  compression: 'low' | 'medium' | 'high'
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer)
  if (doc.isEncrypted) throw new Error('El documento está protegido con contraseña.')
  const newDoc = await PDFDocument.create()
  const copied = await newDoc.copyPages(doc, pages.map((p) => p - 1))
  copied.forEach((p) => newDoc.addPage(p))
  return newDoc.save({
    useObjectStreams: compression !== 'low',
    ...(compression === 'high' ? { objectsPerTick: 50 } : {}),
  })
}

export async function mergeDocuments(
  buffers: ArrayBuffer[],
  compression: 'low' | 'medium' | 'high'
): Promise<Uint8Array> {
  const merged = await PDFDocument.create()
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf)
    const pages = await merged.copyPages(doc, doc.getPageIndices())
    pages.forEach((p) => merged.addPage(p))
  }
  return merged.save({
    useObjectStreams: compression !== 'low',
  })
}

export function downloadBytes(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}
