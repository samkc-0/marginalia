'use client'

import {
  JSX,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
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
import { EPubViewer } from '@/components/EPubViewer'
import { chooseBackground } from './lib/utils'

const DEFAULT_BOOK = '/default.epub'
export default function Home() {
  const [book, setBook] = useState<StoredBook | null>(null)
  const [uploaderOpen, setUploaderOpen] = useState(false)

  const background = chooseBackground()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 font-serif overflow-hidden">
      <FileUploader
        onBookSelected={(book: StoredBook) => {
          setBook(book)
        }}
        onClose={() => setUploaderOpen(false)}
        onFilesUploaded={(files) => console.log(files.join(''))}
        open={uploaderOpen}
      />
      <img
        onClick={() => setUploaderOpen(true)}
        className={'overflow-hidden fixed z-[-2]'}
        src={background}
      />

      {book?.data ? (
        <EPubViewer book={book} />
      ) : (
        <img
          onClick={() => setUploaderOpen(true)}
          className={'overflow-hidden fixed'}
          src={background}
        />
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
