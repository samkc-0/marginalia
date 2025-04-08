import { useState } from 'react'
import { ReaderPage } from './ReaderPage'

export function EPubViewer({
  book,
  position,
}: {
  book: StoredBook
  position?: string
}) {
  const [cfi, setCfi] = useState<string>(() => {
    // handle demo book
    const demoPage = 'epubcfi(/6/14!/4/2/4/1:0)'
    if (typeof window !== 'undefined') {
      const lastCfi = localStorage.getItem(`lastCfi:${book.key}`)
      if (book.name === 'demo.epub' && !lastCfi) return demoPage
      return lastCfi || ''
    }
    return ''
  })

  const [notes, setNotes] = useState<Record<string, Annotation[]>>({})
  const currentNotes = notes[cfi] || []

  const handleRelocate = (newCfi: string) => {
    setCfi(newCfi)
    localStorage.setItem(`lastCfi:${book.key}`, newCfi)
  }
  if (!book.data) return <>book loading</>
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <ReaderPage
        cfi={cfi || 'epubcfi(/6/2[chapter1]!/4/2/6)'}
        notes={currentNotes}
        onRelocate={handleRelocate}
        book={book}
      />
    </div>
  )
}
