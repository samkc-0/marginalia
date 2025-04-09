import { hash } from '@/app/lib/hash'
import Dexie, { type Table } from 'dexie'

const MSG_FILE_READING_FAILED = 'File reading failed: '

class BookDatabase extends Dexie {
  public books!: Table<StoredBook>

  constructor() {
    super('BookDatabase')
    this.version(1).stores({
      books: '++id,key,name,data,type',
    })
  }
}

export const db = new BookDatabase()

export const addBook = async (file: File): Promise<void> => {
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
    const fileHash: string = await hash(fileData)
    const existingBook = await db.books.where('key').equals(fileHash).first()
    if (!existingBook) {
      await db.books.add({
        key: fileHash,
        name: file.name,
        data: fileData,
        type: file.type,
      })
    }
  } catch (error) {
    throw new Error(
      MSG_FILE_READING_FAILED +
        (error instanceof Error ? error.message : String(error))
    )
  }
}

export const addBooks = async (files: File[]): Promise<void> => {
  await Promise.all(files.map((file) => addBook(file)))
}

export const getBooks = async (): Promise<StoredBook[]> => {
  return await db.books.toArray()
}

export const getBookByKey = async (
  key: string
): Promise<StoredBook | undefined> => {
  return await db.books.where('key').equals(key).first()
}

export const deleteBook = async (id: number): Promise<void> => {
  await db.books.delete(id)
}
