'use client'

import {
  JSX,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import Epub, { Book, Rendition } from 'epubjs'
import Section from 'epubjs/types/section'
import { ReaderPage } from '@/components/ReaderPage'
import {
  FiBookOpen,
  FiFolder,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { FileUploader } from '@/components/FileUploader'

type Annotation = {
  headword: string
  explanation?: string
  illustration?: ReactNode
  position: { x: number; y: number }
}

const DEFAULT_BOOK = '/default.epub'
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 font-serif">
      <EPubViewer book={DEFAULT_BOOK} />
    </div>
  )
}

function EPubViewer({ book }: { book: string }) {
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [bookUrl, setBookUrl] = useState(book)
  const [bookKey, setBookKey] = useState(() => {
    const filename = book.split('/').pop()?.split('.').shift() || ''
    const md5 = (str: string) => {
      let hash = 0
      if (str.length === 0) return hash.toString()
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
      }
      return hash.toString()
    }
    return md5(filename)
  })

  const [cfi, setCfi] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`lastCfi:${bookKey}`) || ''
    }
    return ''
  })

  const [notes, setNotes] = useState<Record<string, Annotation[]>>({})
  const currentNotes = notes[cfi] || []

  const handleRelocate = (newCfi: string) => {
    setCfi(newCfi)
    localStorage.setItem(`lastCfi:${bookKey}`, newCfi)
  }

  const handleNext = () => {
    const event = new CustomEvent('navigateEPUB', { detail: 'next' })
    window.dispatchEvent(event)
  }

  const handlePrev = () => {
    const event = new CustomEvent('navigateEPUB', { detail: 'prev' })
    window.dispatchEvent(event)
  }

  const handleFileUpload = (files: File[]) => {
    // todo: handle the uploaded book data
    console.log(files)
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <ReaderPage
        cfi={cfi || 'epubcfi(/6/2[chapter1]!/4/2/6)'}
        notes={currentNotes}
        onRelocate={handleRelocate}
        bookUrl={bookUrl}
        bookKey={bookKey}
      />

      <FileUploader
        open={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onFilesUploaded={handleFileUpload}
        onBookSelected={(book) => {
          console.log(book.name)
        }}
      />

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
