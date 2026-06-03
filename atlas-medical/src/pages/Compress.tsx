import { useState } from 'react'
import { Minimize2, X, Loader2, Download, Trash2, FileCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../components/PageHeader'
import { clsx } from 'clsx'
import { DropZone } from '../components/DropZone'
import { useStore } from '../store/useStore'
import { useToast } from '../context/ToastContext'
import { loadPdf, mergeDocuments, downloadBytes, formatBytes, generateId } from '../lib/pdfUtils'

type Level = 'low' | 'medium' | 'high'

const levels: { id: Level; label: string; desc: string; emoji: string }[] = [
  { id: 'low',    label: 'Ligera',   desc: 'Mejor calidad, menos reducción',   emoji: '🟢' },
  { id: 'medium', label: 'Moderada', desc: 'Balance calidad / tamaño',          emoji: '🟡' },
  { id: 'high',   label: 'Máxima',   desc: 'Mayor reducción, calidad estándar', emoji: '🔴' },
]

export function Compress() {
  const { compressFiles, addCompressFile, removeCompressFile, clearCompressFiles } = useStore()
  const { toast } = useToast()
  const [loading, setLoading]       = useState(false)
  const [processing, setProcessing] = useState(false)
  const [level, setLevel]           = useState<Level>('medium')
  const [results, setResults]       = useState<{ name: string; before: number; after: number }[]>([])

  const handleFiles = async (files: File[]) => {
    setLoading(true)
    for (const file of files) {
      try {
        const data = await file.arrayBuffer()
        const { numPages } = await loadPdf(data)
        addCompressFile({ id: generateId(), name: file.name, size: file.size, totalPages: numPages, pagesToExtract: '', data, addedAt: Date.now() })
      } catch {
        toast(`No se pudo leer ${file.name}`, 'error')
      }
    }
    setLoading(false)
  }

  const handleCompress = async () => {
    if (compressFiles.length === 0) return
    setProcessing(true)
    setResults([])
    const newResults: { name: string; before: number; after: number }[] = []
    for (const file of compressFiles) {
      try {
        const bytes = await mergeDocuments([file.data], level)
        downloadBytes(bytes, file.name.replace('.pdf', '_comprimido.pdf'))
        newResults.push({ name: file.name, before: file.size, after: bytes.byteLength })
      } catch (e: unknown) {
        toast(`Error en ${file.name}: ${e instanceof Error ? e.message : 'Error'}`, 'error')
      }
    }
    setResults(newResults)
    if (newResults.length > 0) toast(`${newResults.length} archivo(s) comprimido(s) 💚`, 'success')
    setProcessing(false)
  }

  const savings = results.reduce((acc, r) => acc + Math.max(0, r.before - r.after), 0)

  return (
    <div className="space-y-8">
      <PageHeader icon={Minimize2} title="Comprimir PDF" subtitle="Reduce el tamaño de tus documentos sin perder información importante." />

      <DropZone onFiles={handleFiles} label="Arrastra PDFs a comprimir" sublabel="Se pueden agregar múltiples archivos" />

      {loading && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="animate-spin" /> Analizando documento...
        </div>
      )}

      {compressFiles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--cg-700)' }}>
              {compressFiles.length} documento(s) · {formatBytes(compressFiles.reduce((a, f) => a + f.size, 0))} total
            </span>
            <button onClick={clearCompressFiles} className="flex items-center gap-1.5 text-xs hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Trash2 size={13} /> Limpiar todo
            </button>
          </div>

          <div className="rounded-2xl glass-card overflow-hidden divide-y" style={{ borderColor: 'var(--border)' }}>
            <AnimatePresence>
              {compressFiles.map((file, i) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #effef4, #dbfde8)' }}>
                    <FileCheck size={15} style={{ color: 'var(--cg-600)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.totalPages} páginas · {formatBytes(file.size)}</p>
                  </div>
                  <button onClick={() => removeCompressFile(file.id)}
                    className="p-1.5 rounded-lg hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                    <X size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {compressFiles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl glass-card p-5 space-y-5">

          {/* Level selector */}
          <div>
            <label className="text-sm font-semibold block mb-3" style={{ color: 'var(--cg-700)' }}>
              Nivel de compresión
            </label>
            <div className="grid grid-cols-3 gap-2">
              {levels.map(({ id, label, desc, emoji }) => (
                <motion.button
                  key={id}
                  onClick={() => setLevel(id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={level === id
                    ? { background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 12px rgba(27,204,97,0.35)' }
                    : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  className={clsx(
                    'flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-sm font-medium border transition-all',
                    level === id ? 'text-white border-[#1bcc61]' : 'hover:border-[#43e583]'
                  )}
                >
                  <span className="text-lg">{emoji}</span>
                  <span>{label}</span>
                  <span className="text-[10px] text-center leading-tight" style={{ color: level === id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleCompress}
            disabled={processing}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 4px 16px rgba(27,204,97,0.35)' }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {processing ? 'Comprimiendo...' : 'Comprimir y descargar'}
          </motion.button>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl glass-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--cg-700)' }}>Resultados</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #43e583, #0fa34a)' }}>
                -{formatBytes(savings)} ahorrados 💚
              </span>
            </div>
            {results.map((r, i) => {
              const pct = r.before > 0 ? Math.round((1 - r.after / r.before) * 100) : 0
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(27,204,97,0.15)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #43e583, #0fa34a)' }}
                        />
                      </div>
                      <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--cg-600)' }}>-{pct}%</span>
                    </div>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <p className="line-through" style={{ color: 'var(--cg-300)' }}>{formatBytes(r.before)}</p>
                    <p className="font-bold" style={{ color: 'var(--cg-600)' }}>{formatBytes(r.after)}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
