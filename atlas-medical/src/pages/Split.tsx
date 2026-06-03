import { useState } from 'react'
import { ScissorsLineDashed, Loader2, Download, Plus, Trash2, FileCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../components/PageHeader'
import { DropZone } from '../components/DropZone'
import { HeartProgress } from '../components/HeartProgress'
import { loadPdf, extractPages, downloadBytes, formatBytes } from '../lib/pdfUtils'
import { useToast } from '../context/ToastContext'

interface Range { id: string; label: string; from: number; to: number }

function newId() { return Math.random().toString(36).slice(2, 9) }

interface SplitFile { name: string; size: number; pages: number; data: ArrayBuffer }

export function Split() {
  const { toast } = useToast()
  const [file, setFile]         = useState<SplitFile | null>(null)
  const [loading, setLoading]   = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [ranges, setRanges]     = useState<Range[]>([{ id: newId(), label: 'Parte 1', from: 1, to: 1 }])

  const handleFile = async (files: File[]) => {
    const f = files[0]; if (!f) return
    setLoading(true)
    const data = await f.arrayBuffer()
    const { numPages } = await loadPdf(data)
    setFile({ name: f.name, size: f.size, pages: numPages, data })
    setRanges([{ id: newId(), label: 'Parte 1', from: 1, to: numPages }])
    setLoading(false)
  }

  const addRange = () => {
    const last = ranges[ranges.length - 1]
    const from = file ? Math.min(last.to + 1, file.pages) : 1
    setRanges(prev => [...prev, { id: newId(), label: `Parte ${prev.length + 1}`, from, to: file?.pages ?? from }])
  }

  const updateRange = (id: string, patch: Partial<Range>) =>
    setRanges(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))

  const removeRange = (id: string) =>
    setRanges(prev => prev.filter(r => r.id !== id))

  const handleSplit = async () => {
    if (!file) return
    setProcessing(true); setProgress(0)
    for (let ri = 0; ri < ranges.length; ri++) {
      const range = ranges[ri]
      try {
        const pages: number[] = []
        for (let i = range.from; i <= range.to; i++) pages.push(i)
        if (pages.length === 0) continue
        const bytes = await extractPages(file.data, pages, 'medium')
        const name = file.name.replace('.pdf', `_${range.label.replace(/\s+/g,'_')}.pdf`)
        downloadBytes(bytes, name)
        setProgress(Math.round(((ri + 1) / ranges.length) * 100))
      } catch (e: unknown) {
        toast(`Error en "${range.label}": ${e instanceof Error ? e.message : 'Error'}`, 'error')
      }
    }
    await new Promise(r => setTimeout(r, 500))
    toast(`${ranges.length} parte${ranges.length !== 1 ? 's' : ''} descargada${ranges.length !== 1 ? 's' : ''} 💚`, 'success')
    setProcessing(false); setProgress(0)
  }

  return (
    <div className="space-y-8">
      <PageHeader icon={ScissorsLineDashed} title="Dividir PDF" subtitle="Divide un PDF en múltiples partes definiendo rangos de páginas." />

      <DropZone onFiles={handleFile} label="Arrastra el PDF a dividir" sublabel="Un solo archivo" />

      {loading && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="animate-spin" /> Leyendo documento...
        </div>
      )}

      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {/* File info */}
            <div className="rounded-2xl glass-card px-5 py-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl"
                style={{ background: 'linear-gradient(135deg,#effef4,#dbfde8)' }}>
                <FileCheck size={16} style={{ color: 'var(--cg-600)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.pages} páginas · {formatBytes(file.size)}</p>
              </div>
              <button onClick={() => setFile(null)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                Cambiar
              </button>
            </div>

            {/* Ranges */}
            <div className="rounded-2xl glass-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Rangos de división
                </label>
                <button onClick={addRange}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white transition-all"
                  style={{ background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 2px 8px rgba(27,204,97,0.3)' }}>
                  <Plus size={12} /> Agregar rango
                </button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {ranges.map((r, i) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>

                      <span className="text-xs font-bold w-5 h-5 flex items-center justify-center rounded-lg shrink-0"
                        style={{ background: 'rgba(27,204,97,0.15)', color: 'var(--cg-700)' }}>
                        {i + 1}
                      </span>

                      <input
                        value={r.label}
                        onChange={e => updateRange(r.id, { label: e.target.value })}
                        placeholder="Nombre"
                        className="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none"
                        style={{ color: 'var(--text-primary)' }}
                      />

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pág.</span>
                        <input type="number" min={1} max={file.pages}
                          value={r.from}
                          onChange={e => updateRange(r.id, { from: Math.max(1, Math.min(file.pages, +e.target.value)) })}
                          className="w-14 text-center text-sm rounded-lg px-2 py-1 focus:outline-none"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>—</span>
                        <input type="number" min={1} max={file.pages}
                          value={r.to}
                          onChange={e => updateRange(r.id, { to: Math.max(r.from, Math.min(file.pages, +e.target.value)) })}
                          className="w-14 text-center text-sm rounded-lg px-2 py-1 focus:outline-none"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          ({r.to - r.from + 1}p)
                        </span>
                      </div>

                      {ranges.length > 1 && (
                        <button onClick={() => removeRange(r.id)}
                          className="p-1.5 rounded-lg hover:text-red-500 transition-colors shrink-0"
                          style={{ color: 'var(--text-secondary)' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Auto-split helper */}
              <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>División rápida:</span>
                {[2, 3, 4].map(n => (
                  <button key={n}
                    onClick={() => {
                      const size = Math.ceil(file.pages / n)
                      const auto: Range[] = []
                      for (let i = 0; i < n; i++) {
                        const from = i * size + 1
                        const to = Math.min((i + 1) * size, file.pages)
                        if (from <= file.pages) auto.push({ id: newId(), label: `Parte ${i + 1}`, from, to })
                      }
                      setRanges(auto)
                    }}
                    className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
                    style={{ color: 'var(--cg-600)', background: 'rgba(27,204,97,0.1)', border: '1px solid rgba(27,204,97,0.2)' }}>
                    ÷{n}
                  </button>
                ))}
              </div>
            </div>

            {processing && (
              <HeartProgress progress={progress} label={`Dividiendo parte ${Math.min(ranges.length, Math.ceil(ranges.length * progress / 100) || 1)} de ${ranges.length}...`} />
            )}

            <motion.button
              onClick={handleSplit}
              disabled={processing}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 4px 16px rgba(27,204,97,0.35)' }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-40 transition-all mt-2"
            >
              {processing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {processing ? 'Dividiendo...' : `Dividir en ${ranges.length} parte${ranges.length !== 1 ? 's' : ''}`}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
