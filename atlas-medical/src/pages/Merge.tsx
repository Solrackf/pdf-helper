import { useState } from 'react'
import { Layers, X, GripVertical, Loader2, Download, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { DropZone } from '../components/DropZone'
import { useStore } from '../store/useStore'
import { useToast } from '../context/ToastContext'
import {
  loadPdf,
  mergeDocuments,
  downloadBytes,
  formatBytes,
  generateId,
} from '../lib/pdfUtils'

type Compression = 'low' | 'medium' | 'high'

export function Merge() {
  const { mergeFiles, addMergeFile, removeMergeFile, reorderMergeFiles, clearMergeFiles } = useStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [compression, setCompression] = useState<Compression>('medium')
  const [outputName, setOutputName] = useState('expediente_consolidado.pdf')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handleFiles = async (files: File[]) => {
    setLoading(true)
    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer()
        const { numPages } = await loadPdf(buffer)
        addMergeFile({
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

  const move = (id: string, dir: -1 | 1) => {
    const idx = mergeFiles.findIndex((f) => f.id === id)
    if (idx === -1) return
    const next = [...mergeFiles]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    reorderMergeFiles(next)
  }

  const onDragStart = (id: string) => setDraggingId(id)
  const onDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id) }
  const onDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) { setDragOverId(null); return }
    const arr = [...mergeFiles]
    const from = arr.findIndex((f) => f.id === draggingId)
    const to = arr.findIndex((f) => f.id === targetId)
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    reorderMergeFiles(arr)
    setDraggingId(null)
    setDragOverId(null)
  }

  const totalPages = mergeFiles.reduce((sum, f) => sum + f.totalPages, 0)
  const totalSize = mergeFiles.reduce((sum, f) => sum + f.size, 0)

  const handleMerge = async () => {
    if (mergeFiles.length < 2) { toast('Agrega al menos 2 documentos', 'warning'); return }
    setProcessing(true)
    try {
      const bytes = await mergeDocuments(mergeFiles.map((f) => f.data), compression)
      downloadBytes(bytes, outputName.endsWith('.pdf') ? outputName : outputName + '.pdf')
      toast('Expediente generado correctamente', 'success')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      toast(`Error al unir documentos: ${msg}`, 'error')
    }
    setProcessing(false)
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-2">
          <div style={{ background: 'linear-gradient(135deg, #81f4ae, #1bcc61)', boxShadow: '0 4px 12px rgba(27,204,97,0.3)' }} className="flex items-center justify-center w-9 h-9 rounded-2xl">
            <Layers size={17} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Unir documentos</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Combina múltiples PDFs en un único expediente. Ordénalos arrastrando.</p>
      </motion.div>

      <DropZone
        onFiles={handleFiles}
        label="Arrastra los documentos a combinar"
        sublabel="Se añadirán al final de la lista"
      />

      {loading && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="animate-spin" />
          Analizando documento...
        </div>
      )}

      {mergeFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {mergeFiles.length} documento(s) · {totalPages} páginas · {formatBytes(totalSize)}
            </h2>
            <button onClick={clearMergeFiles} className="flex items-center gap-1.5 text-xs hover:text-red-500 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Trash2 size={13} /> Limpiar todo
            </button>
          </div>

          <div className="rounded-2xl glass-card overflow-hidden divide-y divide-[#b8fad1]/30 dark:divide-[#10853f]/20">
            {mergeFiles.map((file, idx) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => onDragStart(file.id)}
                onDragOver={(e) => onDragOver(e, file.id)}
                onDrop={() => onDrop(file.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 transition-colors',
                  dragOverId === file.id && 'bg-[#effef4] dark:bg-[#033017]/20',
                  draggingId === file.id && 'opacity-40'
                )}
              >
                <div className="cursor-grab active:cursor-grabbing transition-colors opacity-40 hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                  <GripVertical size={16} />
                </div>
                <div className="flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0" style={{ background: 'rgba(27,204,97,0.15)', color: 'var(--cg-700)' }}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{file.totalPages} páginas · {formatBytes(file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(file.id, -1)} disabled={idx === 0} className="p-1 rounded-md disabled:opacity-25 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => move(file.id, 1)} disabled={idx === mergeFiles.length - 1} className="p-1 rounded-md disabled:opacity-25 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => removeMergeFile(file.id)} className="p-1.5 rounded-lg hover:text-red-500 transition-colors ml-1" style={{ color: 'var(--text-secondary)' }}>
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mergeFiles.length > 0 && (
        <div className="rounded-2xl glass-card p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>Nombre del archivo final</label>
            <input
              type="text"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Nivel de compresión</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as Compression[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCompression(lvl)}
                  style={compression === lvl
                      ? { background: 'linear-gradient(135deg, #43e583, #0fa34a)', boxShadow: '0 2px 8px rgba(27,204,97,0.3)', border: '1px solid #1bcc61', color: 'white' }
                      : { border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  className={clsx(
                    'flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all',
                    compression === lvl
                      ? 'text-white'
                      : 'hover:border-[#43e583]'
                  )}
                >
                  {lvl === 'low' ? 'Baja' : lvl === 'medium' ? 'Media' : 'Alta'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleMerge}
            disabled={processing || mergeFiles.length < 2}
            style={{ background: 'linear-gradient(135deg, #81f4ae, #0fa34a)', boxShadow: '0 4px 16px rgba(27,204,97,0.35)' }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl font-semibold transition-all"
          >
            {processing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {processing ? 'Generando expediente...' : 'Generar expediente unificado'}
          </button>
        </div>
      )}
    </div>
  )
}
