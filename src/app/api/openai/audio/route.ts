import { NextRequest, NextResponse } from 'next/server'
import { getReading } from '@/app/lib/tts'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const word = searchParams.get('word')

  if (!word) {
    return NextResponse.json(
      { error: 'word param is required' },
      { status: 400 }
    )
  }

  const result = await getReading.call(null, word)

  return NextResponse.json({ play: result })
}
