import { useRef, useEffect, useState, SetStateAction } from 'react'
import Epub, { Book, Rendition } from 'epubjs'

const LBL_NEXT_PAGE = '▷'
const LBL_PREVIOUS_PAGE = 'ᐊ'
const LBL_PAGE_NUMBER = 'Page'
const LBL_PAGE_OF = 'of'

interface EPubViewerProps {
  fileData: ArrayBuffer
}

export function EPubViewer({ fileData }: EPubViewerProps) {
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
        <button onClick={previousPage} className="px-4 py-2 bg-black rounded">
          {LBL_PREVIOUS_PAGE}
        </button>
        <span className="text-sm text-black font-sans">{currentLocation}</span>
        <button onClick={nextPage} className="px-4 py-2 bg-black rounded">
          {LBL_NEXT_PAGE}
        </button>
      </div>
    </div>
  )
}
