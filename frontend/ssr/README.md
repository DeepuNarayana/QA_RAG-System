# SSR Demo (Frontend)

This small demo shows how server-side rendering (SSR) can fetch data from the backend and render HTML on the server.

Quick start (inside `frontend/ssr`):

```bash
# install deps
npm install

# start demo
API_URL=http://localhost:8000 npm start
```

The server will render a simple list of books at `http://localhost:3001/` and demonstrates:
- Server-side HTTP fetching of initial data
- Escaping user-provided values for safety
- A minimal approach to SSR separate from the Vite client build

Notes:
- This is a lightweight example for demonstration. For full SSR with React hydration, integrate with a framework (Next.js, Vite SSR, or Remix).
