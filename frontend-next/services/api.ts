import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: API_URL })

export async function getBooks() {
  const res = await client.get('/books')
  return res.data
}

export async function getBook(id: number) {
  const res = await client.get(`/books/${id}`)
  return res.data
}

export default client
