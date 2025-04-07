'use client'
import { JSX, useCallback, useEffect, useState } from 'react'
import { Eagle_Lake as Medieval } from 'next/font/google'
const medieval = Medieval({
  subsets: ['latin'],
  weight: '400',
})

interface DraggableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  x?: number
  y?: number
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  x = 0,
  y = 0,
  children,
  className = '',
  style = {},
  ...rest
}) => {
  const [position, setPosition] = useState({ x, y })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      setIsDragging(true)
      setStartPos({ x: clientX - position.x, y: clientY - position.y })
      e.stopPropagation()
    },
    [position]
  )

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      setPosition({ x: clientX - startPos.x, y: clientY - startPos.y })
      e.preventDefault()
    },
    [isDragging, startPos]
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchmove', handleMove, { passive: false })
      window.addEventListener('touchend', handleEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, handleMove, handleEnd])

  return (
    <div
      {...rest}
      className={`${medieval.className} box-content max-w-[18vw] text-2xl fixed bg-inherit text-inherit backdrop-blur-2xl rounded-sm hover:shadow-lg hover:border p-1 z-50 cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none',
        ...style,
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      {children}
    </div>
  )
}

export function Definition({ headword }: { headword: string }): JSX.Element {
  const [definition, setDefinition] = useState<string>('')
  useEffect(() => {
    const getDefinition = async () => {
      const url = `api/langchain?word=${headword}`
      fetch(url)
        .then((response) => response.json())
        .then(({ definition }) => {
          setDefinition(definition)
        })
    }
    getDefinition()
  }, [])
  if (!definition) return <span className="animate-spin">⏳</span>
  return <>{definition}</>
}
