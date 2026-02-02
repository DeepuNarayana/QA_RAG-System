import React, { useState } from 'react'
import Button from './Button'

export default function BorrowReturn({
  bookId,
  userId,
  borrowed,
  onBorrowSuccess,
}: {
  bookId: number
  userId: number
  borrowed: boolean
  onBorrowSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleBorrow = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/books/${bookId}/borrow`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        setMessage('Book borrowed successfully!')
        if (onBorrowSuccess) onBorrowSuccess()
      } else {
        setMessage('Failed to borrow book')
      }
    } catch (e) {
      setMessage('Error borrowing book')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/books/${bookId}/return`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        setMessage('Book returned successfully!')
        if (onBorrowSuccess) onBorrowSuccess()
      } else {
        setMessage('Failed to return book')
      }
    } catch (e) {
      setMessage('Error returning book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      {borrowed ? (
        <>
          <p className="text-sm text-green-600 mb-2">✓ You have borrowed this book</p>
          <Button onClick={handleReturn} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            {loading ? 'Returning...' : 'Return Book'}
          </Button>
        </>
      ) : (
        <Button onClick={handleBorrow} disabled={loading}>
          {loading ? 'Borrowing...' : 'Borrow Book'}
        </Button>
      )}
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  )
}
