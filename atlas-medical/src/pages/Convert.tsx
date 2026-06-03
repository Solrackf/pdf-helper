import { useState } from 'react'
import { ImageDown, Loader2, Download, FileImage, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from '../components/PageHeader'
import { clsx } from 'clsx'
import { DropZone } from '../components/DropZone'
import { HeartProgress } from '../components/HeartProgress'
import { loadPdf, renderPageFull, formatBytes } from '../lib/pdfUtils'

type Format = 'png' | 'jpg'
type Scale  = '1' | '2' | '3'

interface ConvFile { name: string; size: number; pages: number; data: ArrayBuffer }

export function Convert() {
  const [file, setFile]           = useState<ConvFile | null>(null)
  const [format, setFormat]       = useState<Format>('png')
  const [scale, setScale]         = useState<Scale>('2')
  const [loading, setLoading]     = useState(false)
  const [progress, setProgress]   = useState(0)
  const [done, setDone]           = useState(false)

  const handleFile = async (files: File[]) => {
    const f = files[0]
    if (!f) return
    setLoading(true); setDone(false); setProgress(0)
    const data = await f.arrayBuffer()
    const { numPages } = await loadPdf(data)
    setFile({ name: f.name, size: f.size, pages: numPages, data })
    setLoading(false)
  }

  const handleConvert = async () => {
    if (!file) return
    setLoading(true); setProgress(0); setDone(false)
    const sc = parseFloat(scale)
    for (let i = 1; i <= file.pages; i++) {
      const dataUrl = await renderPageFull(file.data, i, sc, format)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${file.name.replace('.pdf', '')}_p${String(i).padStart(3,'0')}.${format}`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setProgress(Math.round((i / file.pages) * 100))
    }
    setLoading(false); setDone(true)
  }

  const scales: { id: Scale; label: string; desc: string }[] = [
    { id: '1', label: '1×', desc: '~72 dpi' },
    { id: '2', label: '2×', desc: '~144 dpi' },
    { id: '3', label: '3×', desc: '~216 dpi' },
  ]

  return (
    <div className="space-y-8">
      <PageHeader icon={ImageDown} title="Convertir PDF a imágenes" subtitle="Exporta cada página del PDF como imagen PNG o JPG de alta resolución." />

      <DropZone onFiles={handleFile} label="Arrastra el PDF a convertir" sublabel="Solo se procesa un archivo a la vez" />

      {loading && !file && (
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="animate-spin" /> Leyendo documento...
        </div>
      )}

      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl glass-card p-5 space-y-5">

            {/* File info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #effef4, #dbfde8)' }}>
                <FileImage size={18} style={{ color: 'var(--cg-600)' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {file.pages} páginas · {formatBytes(file.size)}
                </p>
              </div>
              <button onClick={() => { setFile(null); setDone(false) }}
                className="ml-auto text-xs px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface-muted)', border: '1px solid var(--border)' }}>
                Cambiar
              </button>
            </div>

            {/* Format */}
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Formato de imagen</label>
              <div className="flex gap-2">
                {(['png', 'jpg'] as Format[]).map(f => (
                  <button key={f} onClick={() => setFormat(f)}
                    style={format === f
                      ? { background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 2px 8px rgba(27,204,97,0.3)', border: '1px solid #1bcc61' }
                      : { border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    className={clsx('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all uppercase tracking-wide',
                      format === f ? 'text-white' : '')}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-primary)' }}>Resolución</label>
              <div className="flex gap-2">
                {scales.map(s => (
                  <button key={s.id} onClick={() => setScale(s.id)}
                    style={scale === s.id
                      ? { background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 2px 8px rgba(27,204,97,0.3)', border: '1px solid #1bcc61' }
                      : { border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    className={clsx('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex flex-col items-center gap-0.5',
                      scale === s.id ? 'text-white' : '')}>
                    <span>{s.label}</span>
                    <span className={clsx('text-[10px] font-normal', scale === s.id ? 'text-white/80' : '')}>{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <HeartProgress
                progress={progress}
                label={`Convirtiendo página ${Math.max(1, Math.ceil(file.pages * progress / 100))} de ${file.pages}...`}
              />
            )}

            {/* Done */}
            <AnimatePresence>
              {done && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(27,204,97,0.1)', border: '1px solid rgba(27,204,97,0.3)' }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--cg-500)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--cg-700)' }}>
                    ¡{file.pages} imagen{file.pages !== 1 ? 'es' : ''} descargada{file.pages !== 1 ? 's' : ''}! 💚
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleConvert}
              disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'linear-gradient(135deg,#43e583,#0fa34a)', boxShadow: '0 4px 16px rgba(27,204,97,0.35)' }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-40 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {loading ? 'Convirtiendo...' : `Convertir ${file.pages} página${file.pages !== 1 ? 's' : ''} a ${format.toUpperCase()}`}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
