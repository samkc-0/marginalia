'use client'
import { JSX, useState } from 'react'
import { useDropzone } from 'react-dropzone'

const MSG_DRAG_ACTIVE = 'Drop the files here...'
const MSG_DRAG_INACTIVE =
  'Drag & drop an ePub file here, or click to select files'

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void
}

export function FileUploader({
  onFilesUploaded,
}: FileUploaderProps): JSX.Element {
  const [files, setFiles] = useState<File[]>([])
  function onDrop(acceptedFiles: File[]) {
    setFiles(acceptedFiles)
    onFilesUploaded(acceptedFiles)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/epub+zip': ['.epub'],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={`border border-dashed border-gray-300 dark:bg-gray-900 p-6 rounded-lg hover:scale-105 transition-all cursor-pointer ${
        isDragActive ? 'bg-gray-200' : 'bg-gray-100'
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-center text-gray-300">
        {isDragActive ? MSG_DRAG_ACTIVE : MSG_DRAG_INACTIVE}
      </p>
    </div>
  )
}
