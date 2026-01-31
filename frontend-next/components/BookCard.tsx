import Link from 'next/link'

export default function BookCard({ book }: { book: any }) {
  return (
    <article className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold">{book.title}</h3>
      <p className="text-sm text-gray-600">{book.author}</p>
      <Link href={`/books/${book.id}`} className="text-blue-600 mt-2 inline-block">View</Link>
    </article>
  )
}
