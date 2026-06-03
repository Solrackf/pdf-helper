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
  renderPageThumbnail,
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

  useEffect(() => {
    extractFiles.forEach((f) => {
      if (!selectedPages[f.id]) {
        const all = Array.from({ length: f.totalPages }, (_, i) => i + 1)
        setSelectedPages((p) => ({ ...p, [f.id]: new Set(all) }))
        updatePageRange(f.id, `1-${f.totalPages}`)
      }
    })
  }, [extractFiles])

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
    const thumbs: PageThumb[] = []
    for (let i = 1; i <= Math.min(file.totalPages, 20); i++) {
      try {
        const src = await renderPageThumbnail(file.data, i, 0.25)
        thumbs.push({ num: i, src })
      } catch { thumbs.push({ num: i, src: '' }) }
    }
    setThumbsMap((m) => ({ ...m, [fileId]: thumbs }))
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
      updatePageRange(fileId, sorted.join(', '))
      return { ...prev, [fileId]: set }
    })
  }

  const selectAll = (fileId: string, total: number) => {
    const all = new Set(Array.from({ length: total }, (_, i) => i + 1))
    const sorted = [...all].join(', ')
    updatePageRange(fileId, sorted)
    setSelectedPages((p) => ({ ...p, [fileId]: all }))
  }

  const selectNone = (fileId: string) => {
    updatePageRange(fileId, '')
    setSelectedPages((p) => ({ ...p, [fileId]: new Set() }))
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
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{file.totalPages} páginas · {formatBytes(file.size)} · {sel.size} seleccionadas</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(file.id)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg" style={{ color: 'var(--cg-600)', background: 'transparent' }}
                    >
                      {isExpanded ? 'Ocultar' : 'Ver páginas'}
                      <ChevronDown size={13} className={clsx('transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                    <button onClick={() => removeExtractFile(file.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <X size={15} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <button onClick={() => selectAll(file.id, file.totalPages)} className="text-xs text-blue-500 hover:underline">Todas</button>
                      <button onClick={() => selectNone(file.id)} className="text-xs text-slate-400 hover:underline">Ninguna</button>
                      <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-xs text-slate-400">Haz clic en las miniaturas para seleccionar</span>
                    </div>

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
                            className={clsx(
                              'relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] bg-slate-100 dark:bg-slate-800',
                              sel.has(num)
                                ? 'scale-[1.03]'
                                : 'border-transparent opacity-50 hover:opacity-80'
                            )}
                          >
                            {src ? <img src={src} alt={`Pág ${num}`} className="w-full h-full object-cover" /> : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">{num}</div>
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
                          <div className="aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">
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
