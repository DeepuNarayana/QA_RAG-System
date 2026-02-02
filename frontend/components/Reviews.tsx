import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Button from './Button'

async function fetchReviews(bookId: number) {
  const res = await fetch(`http://localhost:8000/books/${bookId}/reviews`)
  if (!res.ok) throw new Error('Failed to fetch reviews')
  return res.json()
}

async function submitReview(bookId: number, rating: number, reviewText: string) {
  const res = await fetch(`http://localhost:8000/books/${bookId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ rating, review_text: reviewText }),
  })
  if (!res.ok) throw new Error('Failed to submit review')
  return res.json()
}

export default function Reviews({ bookId, borrowed }: { bookId: number; borrowed: boolean }) {
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  const { data: reviews, isLoading: reviewsLoading, refetch } = useQuery({
    queryKey: ['reviews', bookId],
    queryFn: () => fetchReviews(bookId),
  })

  const mutation = useMutation({
    mutationFn: () => submitReview(bookId, rating, reviewText),
    onSuccess: () => {
      setReviewText('')
      setRating(5)
      refetch()
    },
  })

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>

      {borrowed && (
        <div className="border rounded p-4 bg-gray-50 mb-4">
          <h3 className="font-medium mb-2">Write a Review</h3>
          <div className="mb-2">
            <label className="block text-sm mb-1">Rating (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </div>
          <textarea
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="border rounded p-2 w-full mb-2"
            rows={3}
          />
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
          {mutation.isError && <p className="text-red-600 mt-2">Error submitting review</p>}
        </div>
      )}

      <div className="space-y-3">
        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((r: any) => (
            <div key={r.id} className="border rounded p-3 bg-white">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Rating: {r.rating}/5</span>
                <span className="text-xs text-gray-500">by User {r.user_id}</span>
              </div>
              <p className="text-sm text-gray-700">{r.review_text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </section>
  )
}
