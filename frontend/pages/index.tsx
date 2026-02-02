import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import { dehydrate, QueryClient } from '@tanstack/react-query'

import BookList from '../components/BookList'
import ProtectedRoute from '../components/ProtectedRoute'
import { fetchBooks } from '../services/api'

export default function Home() {
  return (
    <ProtectedRoute>
      <Head>
        <title>Lumina Library - Books</title>
      </Head>
      <main className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Library Books</h1>
          <p className="text-gray-600">Explore our collection of books and start borrowing</p>
        </div>
        <BookList />
      </main>
    </ProtectedRoute>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient()

  try {
    // Prefetch books server-side for SSR
    await queryClient.fetchQuery(['books'], () => fetchBooks())
  } catch (error) {
    // If fetching fails, continue without SSR data
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}
