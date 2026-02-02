import { render, screen } from '@testing-library/react'
import BookCard from '../components/BookCard'

test('renders book title and author', () => {
  const book = { id: '1', title: 'Test Book', author: 'Author' }
  render(<BookCard book={book} />)
  expect(screen.getByText('Test Book')).toBeInTheDocument()
  expect(screen.getByText('Author')).toBeInTheDocument()
})
