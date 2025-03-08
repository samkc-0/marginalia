import Dexie, { type Table } from 'dexie'

const MSG_FILE_READING_FAILED = 'File reading failed: '

class BookDatabase extends Dexie {
  public books!: Table<StoredBook>

  constructor() {
    super('BookDatabase')
    this.version(1).stores({
      books: '++id,name,data,type',
    })
  }
}

export const db = new BookDatabase()

export const addBooks = async (file: File): Promise<void> => {
  const readFileAsArrayBuffer = (): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) =>
        event.target?.result
          ? resolve(event.target.result as ArrayBuffer)
          : reject(new Error(MSG_FILE_READING_FAILED + file.name))
      reader.onerror = () =>
        reject(new Error(MSG_FILE_READING_FAILED + file.name))
      reader.readAsArrayBuffer(file)
    })

  try {
    const fileData = await readFileAsArrayBuffer()
    await db.books.add({
      name: file.name,
      data: fileData,
      type: file.type,
    })
  } catch (error) {
    throw new Error(
      MSG_FILE_READING_FAILED +
        (error instanceof Error ? error.message : String(error))
    )
  }
}

export const getBooks = async (): Promise<StoredBook[]> => {
  return await db.books.toArray()
}

export const deleteBook = async (id: number): Promise<void> => {
  await db.books.delete(id)
}
