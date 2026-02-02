import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Book } from './BookCard'

async function fetchRecommendations(userId: number) {
  const res = await fetch(`http://localhost:8000/books/user/${userId}/recommendations?limit=5`)
  if (!res.ok) throw new Error('Failed to fetch recommendations')
  return res.json()
}

export default function Recommendations({ userId }: { userId: number }) {
  const { data: recs, isLoading, isError } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: () => fetchRecommendations(userId),
  })

  if (isLoading) return <p>Loading recommendations...</p>
  if (isError) return <p>Failed to load recommendations.</p>

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {recs && recs.length > 0 ? (
          recs.map((rec: any) => (
            <div key={rec.id} className="border rounded p-4 bg-white shadow-sm">
              <h3 className="font-medium">{rec.title}</h3>
              <p className="text-sm text-gray-600">{rec.author}</p>
              <p className="text-xs text-gray-500 mt-2">Score: {(rec.score * 100).toFixed(0)}%</p>
            </div>
          ))
        ) : (
          <p>No recommendations available yet.</p>
        )}
      </div>
    </section>
  )
}
