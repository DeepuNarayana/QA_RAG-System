import React, { useState } from 'react'
import Button from './Button'

export default function BookUpload({ bookId, onUploadSuccess }: { bookId: number; onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`http://localhost:8000/books/${bookId}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setMessage('File uploaded successfully. Processing...')
        setFile(null)
        if (onUploadSuccess) onUploadSuccess()
      } else {
        setMessage('Upload failed')
      }
    } catch (e) {
      setMessage('Error uploading file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded p-4 bg-gray-100">
      <h3 className="font-semibold mb-2">Upload Book Content</h3>
      <input type="file" onChange={handleFileChange} className="block mb-2" />
      <Button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </Button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  )
}
