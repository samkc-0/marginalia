'use client'
import { JSX, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { getBooks } from '@/indexeddb/books'

interface StoredBook {
  id?: number
  name: string
  data: ArrayBuffer
  type: string
}

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
  onBookSelected: (book: StoredBook) => void
  open: boolean
  onClose: () => void
}

export function FileUploader({
  onFilesUploaded,
  onBookSelected,
  open,
  onClose,
}: FileUploaderProps): JSX.Element | null {
  const [files, setFiles] = useState<File[]>([])
  const [savedBooks, setSavedBooks] = useState<StoredBook[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setFiles(acceptedFiles)
      onFilesUploaded(acceptedFiles)
      const books = await getBooks()
      setSavedBooks(books)
      onClose()
    },
    accept: { 'application/epub+zip': ['.epub'] },
  })

  useEffect(() => {
    if (open) {
      getBooks().then(setSavedBooks)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        {...getRootProps()}
        className="relative w-[95vw] max-w-3xl p-8 rounded-lg border-2 border-dashed border-gray-400 bg-white dark:bg-gray-900 text-center cursor-pointer transition-all hover:border-gray-600 shadow-lg"
      >
        <input {...getInputProps()} />

        <p className="text-lg text-gray-700 dark:text-gray-200 font-semibold mb-4">
          {isDragActive
            ? '📥 Drop the file here...'
            : '📚 Drag & drop an ePub file, or click to select one'}
        </p>

        {savedBooks.length > 0 && (
          <div className="text-left mt-6 border-t border-gray-300 dark:border-gray-700 pt-4">
            <h2 className="text-base font-bold text-gray-600 dark:text-gray-300 mb-2">
              Your Library
            </h2>
            <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 border rounded-md bg-gray-50 dark:bg-gray-800 p-2">
              {savedBooks.map((book) => (
                <button
                  key={book.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onBookSelected(book)
                    onClose()
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm text-gray-800 dark:text-gray-100"
                >
                  📖 {book.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-white"
          onClick={onClose}
        >
          Cancel ✕
        </button>
      </div>
    </div>
  )
}
