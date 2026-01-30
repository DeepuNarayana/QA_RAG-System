const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:8000';

async function getBooks(skip = 0, limit = 20) {
  const res = await fetch(`${API_URL}/books?skip=${skip}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

module.exports = { getBooks };
