import { useState, useEffect } from 'react'
import { Scissors, X, ChevronDown, Loader2, Download, Trash2, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '../components/PageHeader'
import { clsx } from 'clsx'
import { DropZone } from '../components/DropZone'
import { HeartProgress } from '../components/HeartProgress'
import { useStore } from '../store/useStore'
import { useToast } from '../context/ToastContext'
import {
  loadPdf,
  renderAllThumbnails,
  parsePageRanges,
  extractPages,
  downloadBytes,
  formatBytes,
  generateId,
} from '../lib/pdfUtils'

type Compression = 'low' | 'medium' | 'high'

interface PageThumb {
  num: number
  src: string
}

export function Extract() {
  const { extractFiles, addExtractFile, removeExtractFile, updatePageRange, clearExtractFiles } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [compression, setCompression] = useState<Compression>('medium')
  const [thumbsMap, setThumbsMap] = useState<Record<string, PageThumb[]>>({})
  const [selectedPages, setSelectedPages] = useState<Record<string, Set<number>>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [rangeInputs, setRangeInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    extractFiles.forEach((f) => {
      if (!selectedPages[f.id]) {
        const all = Array.from({ length: f.totalPages }, (_, i) => i + 1)
        setSelectedPages((p) => ({ ...p, [f.id]: new Set(all) }))
        updatePageRange(f.id, `1-${f.totalPages}`)
        setRangeInputs((r) => ({ ...r, [f.id]: `1-${f.totalPages}` }))
      }
    })
  }, [extractFiles, updatePageRange])

  const handleFiles = async (files: File[]) => {
    setLoading(true)
    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer()
        const { numPages } = await loadPdf(buffer)
        addExtractFile({
          id: generateId(),
          name: file.name,
          size: file.size,
          totalPages: numPages,
          pagesToExtract: `1-${numPages}`,
          data: buffer,
          addedAt: Date.now(),
        })
      } catch {
        toast(`Error al leer ${file.name}`, 'error')
      }
    }
    setLoading(false)
  }

  const loadThumbs = async (fileId: string) => {
    if (thumbsMap[fileId]) return
    const file = extractFiles.find((f) => f.id === fileId)
    if (!file) return
    // start with empty placeholders so the grid appears immediately
    setThumbsMap((m) => ({
      ...m,
      [fileId]: Array.from({ length: Math.min(file.totalPages, 20) }, (_, i) => ({ num: i + 1, src: '' }))
    }))
    await renderAllThumbnails(
      file.data,
      20,
      0.25,
      (num, src) => {
        setThumbsMap((m) => ({
          ...m,
          [fileId]: (m[fileId] ?? []).map((t) => t.num === num ? { num, src } : t)
        }))
      }
    )
  }

  const toggleExpand = (id: string) => {
    const next = expandedId === id ? null : id
    setExpandedId(next)
    if (next) loadThumbs(next)
  }

  const togglePage = (fileId: string, page: number) => {
    setSelectedPages((prev) => {
      const set = new Set(prev[fileId] ?? [])
      set.has(page) ? set.delete(page) : set.add(page)
      const sorted = [...set].sort((a, b) => a - b)
      const rangeStr = sorted.join(', ')
      updatePageRange(fileId, rangeStr)
      setRangeInputs((r) => ({ ...r, [fileId]: rangeStr }))
      return { ...prev, [fileId]: set }
    })
  }

  const selectAll = (fileId: string, total: number) => {
    const all = new Set(Array.from({ length: total }, (_, i) => i + 1))
    updatePageRange(fileId, `1-${total}`)
    setRangeInputs((r) => ({ ...r, [fileId]: `1-${total}` }))
    setSelectedPages((p) => ({ ...p, [fileId]: all }))
  }

  const selectNone = (fileId: string) => {
    updatePageRange(fileId, '')
    setRangeInputs((r) => ({ ...r, [fileId]: '' }))
    setSelectedPages((p) => ({ ...p, [fileId]: new Set() }))
  }

  const applyRangeInput = (fileId: string, totalPages: number, value: string) => {
    const pages = parsePageRanges(value, totalPages)
    updatePageRange(fileId, value)
    setSelectedPages((p) => ({ ...p, [fileId]: new Set(pages) }))
  }

  const handleProcess = async () => {
    if (extractFiles.length === 0) return
    setProcessing(true)
    setProgress(0)
    let done = 0
    for (const file of extractFiles) {
      try {
        const pages = parsePageRanges(file.pagesToExtract, file.totalPages)
        if (pages.length === 0) { toast(`Sin páginas válidas en ${file.name}`, 'warning'); continue }
        const bytes = await extractPages(file.data, pages, compression)
        downloadBytes(bytes, file.name.replace('.pdf', '_extraido.pdf'))
        done++
        setProgress(Math.round(((done) / extractFiles.length) * 100))
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error desconocido'
        toast(`Error en ${file.name}: ${msg}`, 'error')
      }
    }
    toast(`${done} archivo(s) descargado(s)`, 'success')
    setProcessing(false)
    setProgress(0)
  }

  return (
    <div className="space-y-8">
      <PageHeader icon={Scissors} title="Extraer páginas" subtitle="Selecciona las páginas que quieres conservar de cada documento." />

      <DropZone onFiles={handleFiles} />

      {loading && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="animate-spin" />
          Analizando documento...
        </div>
      )}

      {extractFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {extractFiles.length} documento(s)
            </h2>
            <button onClick={clearExtractFiles} className="flex items-center gap-1.5 text-xs hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Trash2 size={13} /> Limpiar todo
            </button>
          </div>

          {extractFiles.map((file) => {
            const sel = selectedPages[file.id] ?? new Set()
            const thumbs = thumbsMap[file.id]
            const isExpanded = expandedId === file.id

            return (
              <div key={file.id} className="rounded-2xl glass-card overflow-hidden">

                {/* ── Header row ── */}
                <div className="flex items-start gap-3 p-4 pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {file.totalPages} págs · {formatBytes(file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleExpand(file.id)}
                      className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--cg-600)' }}
                    >
                      {isExpanded ? 'Ocultar' : 'Ver págs'}
                      <ChevronDown size={13} className={clsx('transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                    <button
                      onClick={() => removeExtractFile(file.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {/* ── Range input — ALWAYS VISIBLE ── */}
                <div className="px-4 pb-4">
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Páginas a extraer
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={rangeInputs[file.id] ?? file.pagesToExtract}
                      onChange={(e) => setRangeInputs((r) => ({ ...r, [file.id]: e.target.value }))}
                      onBlur={(e) => applyRangeInput(file.id, file.totalPages, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { applyRangeInput(file.id, file.totalPages, rangeInputs[file.id] ?? ''); (e.target as HTMLInputElement).blur() } }}
                      placeholder="ej. 1-5, 8, 11-13, 50-100"
                      style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: '1.5px solid var(--cg-300)',
                        background: 'var(--bg-page)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        minWidth: 0,
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#1bcc61' }}
                      onBlurCapture={(e) => { e.target.style.borderColor = 'var(--cg-300)' }}
                    />
                    <span
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg shrink-0"
                      style={{ background: 'rgba(27,204,97,0.12)', color: 'var(--cg-600)' }}
                    >
                      {sel.size} / {file.totalPages}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => selectAll(file.id, file.totalPages)} className="text-xs hover:underline font-medium" style={{ color: 'var(--cg-500)' }}>Todas</button>
                    <button onClick={() => selectNone(file.id)} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>Ninguna</button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(129,244,174,0.2)' }}>
                    <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>Toca para seleccionar / deseleccionar páginas</p>

                    {!thumbs ? (
                      <div className="grid grid-cols-6 gap-2">
                        {Array.from({ length: Math.min(file.totalPages, 18) }).map((_, i) => (
                          <div key={i} className="skeleton aspect-[3/4]" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        {thumbs.map(({ num, src }) => (
                          <button
                            key={num}
                            onClick={() => togglePage(file.id, num)}
                            style={sel.has(num) ? { borderColor: '#1bcc61' } : { borderColor: 'transparent' }}
                            className={clsx(
                              'relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/4]',
                              sel.has(num)
                                ? 'scale-[1.03] bg-[#effef4]'
                                : 'opacity-50 hover:opacity-80 bg-[rgba(129,244,174,0.08)]'
                            )}
                          >
                            {src ? <img src={src} alt={`Pág ${num}`} className="w-full h-full object-cover" /> : (
                              <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>{num}</div>
                            )}
                            {sel.has(num) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                                style={{ backgroundColor: '#1bcc61' }}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                              >
                                <Heart size={8} className="text-white" fill="white" />
                              </motion.div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-white bg-black/40 py-0.5">{num}</div>
                          </button>
                        ))}
                        {file.totalPages > 20 && (
                          <div className="aspect-[3/4] rounded-lg flex items-center justify-center text-xs" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
                            +{file.totalPages - 20} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {extractFiles.length > 0 && (
        <div className="rounded-2xl glass-card p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Nivel de compresión</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Compression[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCompression(lvl)}
                  style={compression === lvl ? { background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 2px 8px rgba(27,204,97,0.3)' } : {}}
                  className={clsx(
                    'flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all',
                    compression === lvl
                      ? 'text-white border-[#1bcc61]'
                      : 'hover:border-[#43e583]'
                  )}
                >
                  {lvl === 'low' ? 'Baja' : lvl === 'medium' ? 'Media' : 'Alta'}
                </button>
              ))}
            </div>
          </div>

          {processing && (
            <HeartProgress progress={progress} label="Extrayendo páginas..." />
          )}

          <button
            onClick={handleProcess}
            disabled={processing || extractFiles.length === 0}
            style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 16px rgba(27,204,97,0.35)' }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 disabled:opacity-40 text-white rounded-xl font-semibold transition-all"
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {processing ? 'Procesando...' : 'Descargar documentos'}
          </button>
        </div>
      )}
    </div>
  )
}
