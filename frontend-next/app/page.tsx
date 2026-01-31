import Link from 'next/link'
import { getBooks } from '../services/api'

export default async function Home() {
  const books = await getBooks()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Books</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((b: any) => (
          <li key={b.id} className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold">{b.title}</h2>
            <p className="text-sm text-gray-600">{b.author}</p>
            <Link href={`/books/${b.id}`} className="text-blue-600 mt-2 inline-block">View</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
