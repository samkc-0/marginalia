import { useRef, useEffect, useState, SetStateAction } from 'react'
import Epub, { Book, Rendition } from 'epubjs'

const LBL_NEXT_PAGE = '▷'
const LBL_PREVIOUS_PAGE = 'ᐊ'
const LBL_PAGE_NUMBER = 'Page'
const LBL_PAGE_OF = 'of'
const LBL_CLOSE_BOOK = '⛌'

interface EPubViewerProps {
  fileData: ArrayBuffer
  onClose: () => void
}

export function EPubViewer({ fileData, onClose }: EPubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)

  useEffect(() => {
    if (!fileData) return
    if (bookRef.current) bookRef.current.destroy()
    const book: Book = Epub(fileData)
    bookRef.current = book
    const rendition = book.renderTo(viewerRef.current!, {
      width: '100%',
      height: '100%',
      spread: 'none',
    })

    renditionRef.current = rendition
    rendition.display()
    rendition.on('relocated', (location: Location) => {
      updateLocationInfo(book, location)
    })

    return () => {
      renditionRef.current?.destroy()
      bookRef.current?.destroy()
    }
  }, [fileData])

  function updateLocationInfo(book: Book, location: Location) {
    const { start, end } = location as any

    try {
      const chapter = book.navigation.get(start.href)?.label
      setCurrentLocation(
        `${chapter ? `${chapter} ∙ ` : ''}${LBL_PAGE_NUMBER} ${
          start.index + 1
        } ${LBL_PAGE_OF} ${end.index}`
      )
    } catch {
      setCurrentLocation(`📖 Page ${start.index + 1}`)
    }
  }

  const nextPage = () => {
    renditionRef.current?.next()
  }

  const previousPage = () => {
    renditionRef.current?.prev()
  }

  return (
    <div className="flex flex-col items-center max-w-screen min-w-screen left-0 h-screen fixed top-0 bg-white shadow-lg">
      <div
        ref={viewerRef}
        className="w-full flex-1"
        role="document"
        aria-label="EPub viewer"
      />
      <div className="flex justify-between w-full p-2">
        <Button onClick={previousPage} label={LBL_PREVIOUS_PAGE} />
        <span className="text-sm text-black font-sans">{currentLocation}</span>
        <Button onClick={nextPage} label={LBL_NEXT_PAGE} />
        <Button
          onClick={onClose}
          label={LBL_CLOSE_BOOK}
          position={['0', '0']}
        />
      </div>
    </div>
  )
}

interface ButtonProps {
  onClick: () => void
  label: string
  position?: [string, string]
}
function Button({ onClick, label, position }: ButtonProps) {
  let className = 'px-4 py-2 text-white bg-black rounded'
  if (position != null)
    className += ` fixed right-${position[0]} top-${position[1]}`
  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  )
}
