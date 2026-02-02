import React from 'react'

export type Book = {
  id: string
  title: string
  author?: string
  summary?: string
}

export default function BookCard({ book }: { book: Book }) {
  return (
    <article className="border rounded p-4 bg-white shadow-sm">
      <h3 className="text-lg font-medium">{book.title}</h3>
      {book.author && <p className="text-sm text-gray-600">{book.author}</p>}
      {book.summary && <p className="mt-2 text-sm text-gray-700">{book.summary}</p>}
    </article>
  )
}
