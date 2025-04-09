import { useEffect, useRef } from 'react'
import Epub, { Book, Rendition } from 'epubjs'

interface ReaderPageProps {
  cfi: string
  notes: Annotation[]
  onRelocate: (newCfi: string) => void
  book: StoredBook
  fontSize?: string // e.g., '1.5rem'
}

export function ReaderPage({
  cfi,
  notes,
  onRelocate,
  book,
  fontSize,
}: ReaderPageProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const epubRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    // center on canvas
    el.scrollTo({
      top: el.scrollHeight / 2 - el.clientHeight / 2,
      left: el.scrollWidth / 2 - el.clientWidth / 2,
      behavior: 'instant', // or 'smooth'
    })
  }, [])

  useEffect(() => {
    if (!book.data) {
      throw new Error('Book data is missing')
    }
    const epub: Book = Epub(book.data)
    epubRef.current = epub

    const rendition = epub.renderTo(viewerRef.current!, {
      width: '100%',
      height: '100%',
      spread: 'none',
    })

    renditionRef.current = rendition

    rendition.themes.default({
      body: {
        'font-family': '"Avenir", sans-serif',
        'font-size': fontSize ?? '1.25rem',
        'line-height': '2.2',
        margin: '0 auto',
        'max-width': '700px',
        padding: '2rem',
        'text-align': 'left',
      },
    })
    rendition.display(cfi)

    rendition.on('relocated', (location: { start: { cfi: string } }) => {
      const newCfi = location.start.cfi
      console.log(newCfi)
      onRelocate(newCfi)
    })

    window.addEventListener('navigateEPUB', handleNavigate)

    return () => {
      window.removeEventListener('navigateEPUB', handleNavigate)
      rendition.destroy()
      epub.destroy()
    }
  }, [book.data, cfi, fontSize, onRelocate])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = scrollRef.current
      if (!el) return

      const scrollAmount = 80

      switch (e.key) {
        case 'ArrowRight':
          window.dispatchEvent(
            new CustomEvent('navigateEPUB', { detail: 'next' })
          )
          break
        case 'ArrowLeft':
          window.dispatchEvent(
            new CustomEvent('navigateEPUB', { detail: 'prev' })
          )
          break
        case 'w':
        case 'W':
          el.scrollBy({ top: -scrollAmount, behavior: 'smooth' })
          break
        case 'a':
        case 'A':
          el.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
          break
        case 's':
        case 'S':
          el.scrollBy({ top: scrollAmount, behavior: 'smooth' })
          break
        case 'd':
        case 'D':
          el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNavigate = (event: Event) => {
    const nav = (event as CustomEvent<string>).detail
    if (!renditionRef.current) return
    if (nav === 'next') renditionRef.current.next()
    if (nav === 'prev') renditionRef.current.prev()
  }

  return (
    <div
      ref={scrollRef}
      className="w-full h-full overflow-scroll bg-white shadow-lg"
    >
      <div className="relative w-[2000px] h-[2000px]">
        {/* center book */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            ref={viewerRef}
            className="w-[400vw] max-w-[700px] h-[100vh] p-4 bg-white border-gray-300"
            tabIndex={0}
          />
        </div>

        {/* render annotations */}
        {notes.map((note, i) => (
          <div
            key={i}
            className="absolute z-50 bg-yellow-100 text-black border rounded shadow p-2 cursor-move"
            style={{
              left: note.position.x,
              top: note.position.y,
            }}
          >
            <strong>{note.headword}</strong>
            <div>{note.explanation || '...'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
