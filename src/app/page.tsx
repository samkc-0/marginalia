'use client'
import { BookManager } from '@/components/BookManager'
import { Cormorant_Unicase as Medieval } from 'next/font/google'

const medieval = Medieval({
  weight: '400',
  subsets: ['latin'],
})

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 font-serif">
      <Heading />
      <BookManager />
    </div>
  )
}

function Heading() {
  return (
    <h1
      className={`fixed top-0 w-full text-center p-4 text-4xl font-bold cursor-default ${medieval.className}`}
    >
      Marginalia 🪶
    </h1>
  )
}
