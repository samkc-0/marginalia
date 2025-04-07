'use client'
import { JSX, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { getBooks, addBooks, deleteBook } from '@/indexeddb/books'

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
      addBooks(acceptedFiles)
      const books = await getBooks()
      setSavedBooks(books)
      onClose()
    },
    accept: { 'application/epub+zip': ['.epub'] },
  })

  const handleDeleteBook = async (bookId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteBook(bookId)
    const books = await getBooks()
    setSavedBooks(books)
  }

  useEffect(() => {
    if (open) {
      getBooks().then(setSavedBooks)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-700/50 rounded-full transition-colors"
        onClick={onClose}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L11 11M1 11L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="flex flex-col items-center relative w-[95vw] max-w-2xl p-8 rounded-lg border-2  border-slate-500 bg-slate-800 text-center transition-all hover:border-slate-400 shadow-lg">
        {savedBooks.length > 0 && (
          <div className="w-full">
            <h2 className="text-base font-bold text-slate-200 mb-2">
              Your Library
            </h2>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-600 border border-slate-600 rounded-t-md rounded-b-none bg-slate-700/50 p-2">
              {savedBooks.map((book) => (
                <div
                  key={book.id}
                  className="group flex items-center justify-between hover:bg-slate-600/50 transition"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onBookSelected(book)
                      onClose()
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-100"
                  >
                    📖 {book.name}
                  </button>
                  <button
                    onClick={(e) => handleDeleteBook(book.id!, e)}
                    className="opacity-0 group-hover:opacity-100 px-3 py-2 text-slate-300 hover:text-red-500 transition-opacity"
                    title="Delete book"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div
          {...getRootProps()}
          className="flex justify-center items-center w-full p-8 rounded-b-lg border-2 border-dashed border-slate-500 bg-slate-800 cursor-pointer"
        >
          <p className="text-lg text-slate-200 font-semibold text-center">
            {isDragActive
              ? '📥 Drop the file here...'
              : '📚 Drag & drop an ePub file, or click to select one'}
          </p>
        </div>
      </div>
    </div>
  )
}
