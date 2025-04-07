declare global {
  interface StoredBook {
    id?: number
    name: string
    data: ArrayBuffer
    type: string
    key: string
  }

  type Annotation = {
    headword: string
    explanation?: string
    illustration?: ReactNode
    position: { x: number; y: number }
  }
}

export {}
