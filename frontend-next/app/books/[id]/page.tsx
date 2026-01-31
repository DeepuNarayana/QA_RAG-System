import { notFound } from 'next/navigation'
import { getBook } from '../../../services/api'

interface Props { params: { id: string } }

export default async function BookPage({ params }: Props) {
  const book = await getBook(parseInt(params.id, 10))
  if (!book) return notFound()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">{book.title}</h1>
      <p className="text-gray-600">{book.author}</p>
      <section className="mt-4 bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Summary</h2>
        <p className="mt-2 text-sm text-gray-800">{book.summary || 'No summary available'}</p>
      </section>
    </div>
  )
}
