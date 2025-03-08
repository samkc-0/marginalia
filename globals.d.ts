declare global {
  interface StoredBook {
    id?: number
    name: string
    data: ArrayBuffer
    type: string
  }
}

export {}
