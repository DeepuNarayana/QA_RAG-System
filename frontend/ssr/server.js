const express = require('express');
const { getBooks } = require('./bookServiceServer');

const app = express();

app.get('/', async (req, res) => {
  try {
    const books = await getBooks(0, 10);
    // Simple server-side rendered list
    const items = books.map(b => `<li>${escapeHtml(b.title)} — ${escapeHtml(b.author)}</li>`).join('');
    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Books (SSR Demo)</title>
        </head>
        <body>
          <h1>Server-Side Rendered Books</h1>
          <ul>${items}</ul>
        </body>
      </html>`;
    res.send(html);
  } catch (err) {
    res.status(500).send('SSR fetch failed: ' + String(err));
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`SSR demo running on http://localhost:${port}`));
