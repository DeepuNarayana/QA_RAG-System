import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useQuery, dehydrate, QueryClient } from '@tanstack/react-query'
import Header from '../../components/Header'
import BorrowReturn from '../../components/BorrowReturn'
import BookUpload from '../../components/BookUpload'
import Reviews from '../../components/Reviews'
import Recommendations from '../../components/Recommendations'
import { fetchBook, getUserBorrows } from '../../services/api'
import axios from 'axios'

/**
 * Server-side API client with optional authentication
 * Used for SSR data fetching with token support
 */
function createServerClient(token?: string) {
  return axios.create({
    baseURL: process.env.API_URL || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
}

interface BookDetailProps {
  bookId: string
  userId: string
}

export default function BookDetail({ bookId, userId }: BookDetailProps) {
  const router = useRouter()
  const { id } = router.query

  // Use prefetched data from server with stale-while-revalidate
  const { data: book, isLoading, isError, refetch } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBook(bookId),
    enabled: !!bookId,
    staleTime: 60 * 1000, // 1 minute - data from server is fresh
  })

  // Fetch user borrows if userId available
  const { data: borrows = [], isLoading: borrowsLoading } = useQuery({
    queryKey: ['borrows', userId],
    queryFn: () => (userId ? getUserBorrows(userId) : Promise.resolve([])),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  })

  const borrowed = borrows?.some((b: any) => b.book_id === Number(id) && !b.returned_at) || false

  if (isLoading) return <p className="text-center py-8">Loading book details...</p>
  if (isError || !book) return <p className="text-center py-8 text-red-600">Book not found</p>

  return (
    <>
      <Head>
        <title>{book.title} - Lumina Library</title>
      </Head>
      <Header />
      <main className="max-w-4xl mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg text-gray-600 mb-2">by {book.author}</p>
            {book.genre && <p className="text-sm text-gray-500 mb-4">Genre: {book.genre}</p>}

            {book.summary && (
              <div className="bg-blue-50 rounded p-4 mb-4">
                <h2 className="font-semibold mb-2">Summary</h2>
                <p className="text-sm">{book.summary}</p>
              </div>
            )}

            {book.description && (
              <div className="mb-4">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-sm text-gray-700">{book.description}</p>
              </div>
            )}

            <BorrowReturn bookId={Number(id)} userId={Number(userId) || 1} borrowed={borrowed} onBorrowSuccess={() => refetch()} />

            {borrowed && <BookUpload bookId={Number(id)} />}

            <Reviews bookId={Number(id)} borrowed={borrowed} />
          </div>

          <aside>
            <div className="bg-gray-50 rounded p-4 mb-4">
              <h3 className="font-semibold mb-2">Details</h3>
              {book.year_published && <p className="text-sm">Year: {book.year_published}</p>}
              {book.pages && <p className="text-sm">Pages: {book.pages}</p>}
              {book.isbn && <p className="text-sm">ISBN: {book.isbn}</p>}
              <p className="text-sm mt-2">Rating: {(book.average_rating || 0).toFixed(1)}/5</p>
            </div>

            {userId && <Recommendations userId={Number(userId)} />}
          </aside>
        </div>
      </main>
    </>
  )
}

/**
 * Server-side data fetching for optimal performance and SEO
 * Prefetches book data and user borrows on the server
 * Returns dehydrated state to client for immediate hydration
 */
export const getServerSideProps: GetServerSideProps<BookDetailProps> = async (context) => {
  const { id } = context.params as { id: string }
  const { userId } = context.query as { userId?: string }
  const token = context.req.cookies?.access_token

  const queryClient = new QueryClient()
  const serverClient = createServerClient(token)

  try {
    // Prefetch book data on server
    await queryClient.prefetchQuery(['book', id], async () => {
      const response = await serverClient.get(`/books/${id}`)
      return response.data
    })

    // Prefetch user borrows if userId available
    if (userId) {
      await queryClient.prefetchQuery(['borrows', userId], async () => {
        const response = await serverClient.get(`/borrows/user/${userId}`)
        return response.data
      })
    }
  } catch (error) {
    console.error('Error prefetching book data:', error)
    // Return 404 if book not found
    return { notFound: true }
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      bookId: id,
      userId: userId || '',
    },
    revalidate: 60, // ISR: revalidate every 60 seconds
  }
}
