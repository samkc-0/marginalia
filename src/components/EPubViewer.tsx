import { useState } from 'react'
import { ReaderPage } from './ReaderPage'

export function EPubViewer({ book }: { book: StoredBook }) {
  const [cfi, setCfi] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const lastCfi = localStorage.getItem(`lastCfi:${book.key}`)
      return lastCfi || ''
    }
    return ''
  })

  const notes = useState<Record<string, Annotation[]>>({})[0]
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
