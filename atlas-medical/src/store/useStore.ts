import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PdfFile {
  id: string
  name: string
  size: number
  totalPages: number
  pagesToExtract: string
  data: ArrayBuffer
  addedAt: number
}

interface AppState {
  darkMode: boolean
  toggleDark: () => void

  extractFiles: PdfFile[]
  addExtractFile: (file: PdfFile) => void
  removeExtractFile: (id: string) => void
  updatePageRange: (id: string, range: string) => void
  clearExtractFiles: () => void

  mergeFiles: PdfFile[]
  addMergeFile: (file: PdfFile) => void
  removeMergeFile: (id: string) => void
  reorderMergeFiles: (files: PdfFile[]) => void
  clearMergeFiles: () => void

  compressFiles: PdfFile[]
  addCompressFile: (file: PdfFile) => void
  removeCompressFile: (id: string) => void
  clearCompressFiles: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDark: () =>
        set((s) => {
          const next = !s.darkMode
          document.body.classList.toggle('dark', next)
          return { darkMode: next }
        }),

      extractFiles: [],
      addExtractFile: (file) =>
        set((s) => ({ extractFiles: [...s.extractFiles, file] })),
      removeExtractFile: (id) =>
        set((s) => ({ extractFiles: s.extractFiles.filter((f) => f.id !== id) })),
      updatePageRange: (id, range) =>
        set((s) => ({
          extractFiles: s.extractFiles.map((f) =>
            f.id === id ? { ...f, pagesToExtract: range } : f
          ),
        })),
      clearExtractFiles: () => set({ extractFiles: [] }),

      mergeFiles: [],
      addMergeFile: (file) =>
        set((s) => ({ mergeFiles: [...s.mergeFiles, file] })),
      removeMergeFile: (id) =>
        set((s) => ({ mergeFiles: s.mergeFiles.filter((f) => f.id !== id) })),
      reorderMergeFiles: (files) => set({ mergeFiles: files }),
      clearMergeFiles: () => set({ mergeFiles: [] }),

      compressFiles: [],
      addCompressFile: (file) =>
        set((s) => ({ compressFiles: [...s.compressFiles, file] })),
      removeCompressFile: (id) =>
        set((s) => ({ compressFiles: s.compressFiles.filter((f) => f.id !== id) })),
      clearCompressFiles: () => set({ compressFiles: [] }),
    }),
    {
      name: 'atlas-settings',
      partialize: (s) => ({ darkMode: s.darkMode }),
    }
  )
)
