import { useQuery } from '@tanstack/react-query'
import { fetchBooks, Book } from '../api'

export default function useBooks() {
  return useQuery<Book[], Error>(['books'], fetchBooks)
}
