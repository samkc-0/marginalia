'use client'

import { useEffect, useRef, useState } from 'react'
import Epub, { Book, Rendition } from 'epubjs'
import Section from 'epubjs/types/section'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-serif">
      <EPubViewer />
    </div>
  )
}

const DEFAULT_BOOK = '/default.epub'

interface EPubViewerProps {
  fontSize?: number
}
export function EPubViewer({ fontSize = 2 }: EPubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<Book | null>(null)
  const renditionRef = useRef<Rendition | null>(null)
  const [chapters, setChapters] = useState<string[]>([])
  const [currentChapter, setCurrentChapter] = useState<string | null>(null)

  const DEFAULT_THEME = {
    body: {
      'font-family': '"EB Garamond", serif',
      'font-size': `${fontSize}rem`,
      'max-width': '50vw',
      margin: '0 auto',
      'padding-left': '5vw',
      'padding-right': '5vw',
      'text-align': 'justify',
    },
  }

  useEffect(() => {
    loadBook(DEFAULT_BOOK)
  }, [])

  const handleNextPage = () => {
    renditionRef.current?.next()
  }

  const handlePrevPage = () => {
    renditionRef.current?.prev()
  }

  useEffect(() => {
    if (renditionRef.current) renditionRef.current.themes.default(DEFAULT_THEME)
  }, [fontSize])

  const handleKeyPress: React.KeyboardEventHandler = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key === 'ArrowRight') handleNextPage()
    if (event.key === 'ArrowLeft') handlePrevPage()
  }

  useEffect(() => {
    function focusViewer(): void {
      viewerRef.current?.focus()
    }
    window.addEventListener('keydown', focusViewer)
    return () => window.removeEventListener('keydown', focusViewer)
  }, [])

  const loadBook = async (url: string) => {
    const book = Epub(url)
    bookRef.current = book

    const rendition = book.renderTo(viewerRef.current!, {
      width: '60vw',
      height: '100%',
      spread: 'none',
    })

    renditionRef.current = rendition
    // When the content is rendered
    rendition.on('rendered', function (section: Section) {
      // Access the iframe's content
      const iframe = document.querySelector('iframe')
      if (!iframe) {
        console.log('no iframe')
        return
      }

      const doc = iframe.contentDocument || iframe.contentWindow!.document
      const contents = doc.body

      // Function to wrap words in spans
      function wrapWordsInSpan(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent) {
            const text = node.textContent!.trim()
            const words = text.split(/\s+/)
            const spanContainer = document.createElement('span')
            words.forEach((word, index) => {
              const span = document.createElement('span')
              span.classList.add('word')
              span.textContent = word
              spanContainer.appendChild(span)
              if (index < words.length - 1) {
                spanContainer.appendChild(document.createTextNode(' '))
              }
            })
            if (!node.parentNode) throw new Error(`No parent node for ${node}`)
            node.parentNode!.replaceChild(spanContainer, node)
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Recursively process child nodes
          Array.from(node.childNodes).forEach((child) => wrapWordsInSpan(child))
        }
      }

      // Apply the wrapping to all text nodes in the rendered content
      wrapWordsInSpan(contents)
      viewerRef.current!.focus()
    })
    rendition.display()

    rendition.themes.default(DEFAULT_THEME)

    // Add click handler for word highlighting
    rendition.on('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('word')) {
        const position = { x: event.clientX, y: event.clientY }
        // create react component for word, x, y that is the card and is draggable
        console.log(position)
        viewerRef.current?.focus()
      }
      event.stopPropagation()
    })

    const toc = await book.loaded.navigation
    const chapterList = toc.toc.map((chapter) => chapter.href)
    setChapters(chapterList)
    setCurrentChapter(chapterList[0])
  }

  return (
    <>
      <div
        ref={viewerRef}
        className="fixed top-0 focus:outline-none w-full h-full bg-transparent px-[20vw]"
        tabIndex={0}
        onKeyDown={handleKeyPress}
      />
      <ImageButton
        corner="bottomright"
        src="rpg_arrow_left.png"
        activeAnimation="active:translate-x-2"
        onClick={handleNextPage}
      >
        &gt;
      </ImageButton>
      <ImageButton
        corner="bottomleft"
        src="rpg_arrow_right.png"
        activeAnimation="active:-translate-x-2"
        onClick={handlePrevPage}
      >
        &lt;
      </ImageButton>
    </>
  )
}

interface ImageButtonProps {
  corner: 'topleft' | 'topright' | 'bottomright' | 'bottomleft'
  src: string
  activeAnimation: string
}
const ImageButton = ({
  corner,
  src,
  activeAnimation,
  children,
  ...rest
}: ImageButtonProps &
  React.PropsWithChildren &
  React.HTMLAttributes<HTMLButtonElement>) => {
  const className = getClassName()
  const focusStyle = ''
  return (
    <button
      {...rest}
      className={`
        fixed ${className} w-16 h-16 p-0 border-none bg-transparent 
        shadow-none hover:scale-[1.02] transition-all duration-100 
        select-none ${activeAnimation} ${focusStyle}`}
    >
      <img
        src={src}
        className="w-full h-100% object-contain drop-shadow-lg hover:drop-shadow-xl transition-all"
        alt={`Navigation arrow ${corner}`}
      />
    </button>
  )

  function getClassName(margin: string = '0') {
    switch (corner) {
      case 'topleft':
        return `top-4 left-4`
      case 'topright':
        return `top-4 right-4`
      case 'bottomleft':
        return `bottom-4 left-4`
      case 'bottomright':
        return `bottom-4 right-4`
      default:
        throw new Error(`Invalid corner, '${corner}'`)
    }
  }
}
