'use client'

import { JSX, MouseEventHandler, ReactNode, useEffect, useState } from 'react'
import {
  FiBookOpen,
  FiFolder,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { FileUploader } from '@/components/FileUploader'
import { EPubViewer } from '@/components/EPubViewer'
import { addBook, getBookByKey, getBooks } from '@/indexeddb/books'
import { hash } from './lib/hash'

export default function Home() {
  const [book, setBook] = useState<StoredBook | null>(null)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  useEffect(() => {
    const load = async () => {
      if (isFirstLoad()) await setupDemo()
      getLastOpenedBook().then(setBook)
    }
    load()
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 font-serif bg-slate-800 overflow-hidden">
      <FileUploader
        onBookSelected={(book: StoredBook) => {
          rememberLastBook(book)
          setBook(book)
        }}
        onClose={() => setUploaderOpen(false)}
        open={uploaderOpen}
      />

      {book?.data ? (
        <EPubViewer book={book} />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <h1 className="animate-spin text-7xl">⏳</h1>
        </div>
      )}

      <TaskBar>
        <TaskBarItem onClick={handlePrev}>
          <FiChevronLeft />
        </TaskBarItem>
        <TaskBarItem onClick={() => setUploaderOpen(!uploaderOpen)}>
          <FiFolder />
        </TaskBarItem>
        <TaskBarItem>
          <FiBookOpen />
        </TaskBarItem>
        <TaskBarItem onClick={handleNext}>
          <FiChevronRight />
        </TaskBarItem>
      </TaskBar>
    </div>
  )
}

function TaskBar({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-0 px-0 py-0 bg-black text-white">
      {children}
    </div>
  )
}

function TaskBarItem({
  onClick,
  children,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined
  children: ReactNode
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex gap-0 items-center justify-center w-full px-3 py-3 text-xl text-white bg-transparent hover:bg-gray-700"
    >
      {children}
    </button>
  )
}

function handleNext() {
  const event = new CustomEvent('navigateEPUB', { detail: 'next' })
  window.dispatchEvent(event)
}

function handlePrev() {
  const event = new CustomEvent('navigateEPUB', { detail: 'prev' })
  window.dispatchEvent(event)
}

function rememberLastBook(book: StoredBook): void {
  try {
    localStorage.setItem('lastBook', book.key)
  } catch (error) {
    console.error('Failed to store last book:', error)
  }
}

async function getLastOpenedBook(): Promise<StoredBook> {
  const lastBookKey = localStorage.getItem('lastBook')
  if (!lastBookKey)
    throw new Error(
      'calling `getLastOpenedBook` when no book has ever been opened?'
    )
  let book = await getBookByKey(lastBookKey)
  if (book == null) book = await loadDefaultBook()
  return book
}

async function loadDefaultBook(): Promise<StoredBook> {
  const book = await fetch('/demo.epub')
    .then((response) => response.arrayBuffer())
    .then(async (data) => {
      const hashValue = await hash(data)
      return {
        key: hashValue,
        name: 'demo.epub',
        data: data,
        type: 'application/epub+zip',
      }
    })
  if (!book) throw new Error("demo book couldn't load.")
  return book
}

async function setupDemo(): Promise<void> {
  const demoBook = await fetch('/demo.epub')
    .then((response) => response.blob())
    .then(
      (blob) => new File([blob], 'demo.epub', { type: 'application/epub+zip' })
    )

  await addBook(demoBook)
  const book = await getBooks().then((books) =>
    books.find((b) => b.name === 'demo.epub')
  )
  if (!book) throw new Error('Demo book not found after adding')
  const demoKey = book.key
  localStorage.setItem('lastBook', demoKey)
  const demoPage = 'epubcfi(/6/14!/4/2/4/1:0)'
  localStorage.setItem(`lastCfi:${demoKey}`, demoPage)
}

function isFirstLoad(): boolean {
  // Check if lastBook exists in localStorage
  const lastBookKey = localStorage.getItem('lastBook')
  // If it doesn't exist, this is the first load
  return lastBookKey === null
}
