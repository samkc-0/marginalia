import { addBooks, deleteBook, getBooks } from '@/indexeddb/books'
import { JSX, useEffect, useState } from 'react'
import { FileUploader } from './FileUploader'
import { EPubViewer } from './EPubViewer'

const LBL_DELETE = 'Delete'
const LBL_SAVED_BOOKS = 'Saved books'

export function BookManager(): JSX.Element {
  const [savedBooks, setSavedBooks] = useState<StoredBook[]>([])
  const [selectedBook, setSelectedBook] = useState<StoredBook | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    const books = await getBooks()
    setSavedBooks(books)
  }

  async function handleFilesUploaded(files: File[]) {
    for (const file of files) {
      await addBooks(file)
    }
    await loadBooks()
  }

  async function handleDelete(id: number) {
    await deleteBook(id)
    setSavedBooks((prevBooks) => prevBooks.filter((book) => book.id !== id))
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <FileUploader onFilesUploaded={handleFilesUploaded} />
        <h2 className="mt-6 text-lg dark: text-gray-300 font-bold cursor-default">
          ──── {LBL_SAVED_BOOKS} ────
        </h2>
        <ul>
          {savedBooks.length ? (
            savedBooks.map((book, i) => (
              <li
                key={book.id}
                className="flex justify-between items-center text-sm text-gray-500 font-sans cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <span className="transition-colors hover:dark:text-gray-300 hover:text-gray-600">
                  📖 {book.name}
                </span>
                <button
                  className="ml-4 px-2 py-1 text-xs bg-red-500 dark:bg-amber-800 text-white font-mono rounded cursor-pointer uppercase hover:scale-105 transition-all"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent triggering file open
                    if (!book.id)
                      throw new Error(`Book ${book.name} has no id.`)
                    handleDelete(book.id)
                  }}
                >
                  {LBL_DELETE} ✖
                </button>
              </li>
            ))
          ) : (
            <span className="text-gray-500 font-mono">{'(none)'}</span>
          )}
        </ul>
        {selectedBook && (
          <div className="mt-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold">Reading: {selectedBook.name}</h3>
            <EPubViewer fileData={selectedBook.data} />
          </div>
        )}
      </div>
    </>
  )
}
