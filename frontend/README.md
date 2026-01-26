# Frontend - Intelligent Book Management System

A production-ready React TypeScript frontend for intelligent book management.

## Features

- ✅ React 18 with TypeScript
- ✅ Modern UI with CSS modules and responsive design
- ✅ Authentication (Login, Register, Logout)
- ✅ Book management interface
- ✅ Review and rating system
- ✅ Zustand for state management
- ✅ Axios for API calls with interceptors
- ✅ Modular component architecture
- ✅ Unit tests with Vitest
- ✅ CI/CD ready

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable React components
│   ├── pages/             # Page components (home, login, books, etc.)
│   ├── services/          # API service layer
│   ├── store/             # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # CSS stylesheets
│   ├── utils/             # Utility functions
│   ├── __tests__/         # Unit tests
│   ├── App.tsx            # Main App component
│   └── main.tsx           # Entry point
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── index.html             # HTML template
```

## Setup Instructions

### 1. Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8000`

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Environment Configuration

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

### 4. Development Server

```bash
npm run dev
```

Access at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checker |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   ├── Main Content
│   │   ├── HomePage
│   │   ├── LoginPage
│   │   │   └── Input, Button
│   │   ├── RegisterPage
│   │   │   └── Input, Button
│   │   └── BooksListPage
│   │       └── BookCard (multiple)
│   └── Footer
```

## State Management (Zustand)

### Auth Store
- `user`: Current logged-in user
- `token`: JWT access token
- `login()`: Authenticate user
- `register()`: Create new account
- `logout()`: Sign out user

### Book Store
- `books`: Array of books
- `currentBook`: Currently viewed book
- `reviews`: Book reviews
- `fetchBooks()`: Get all books
- `createBook()`: Add new book
- `updateBook()`: Modify book
- `deleteBook()`: Remove book
- `addReview()`: Post review
- `deleteReview()`: Remove review

## API Integration

The frontend uses Axios with automatic:
- Request interceptors for JWT token injection
- Response interceptors for error handling
- 401 auto-logout on token expiration
- CORS configuration

## Styling Approach

- **CSS-in-CSS** for component styles
- **CSS Variables** for theming
- **BEM** naming convention
- **Mobile-first** responsive design
- **Flexbox & Grid** for layouts

### CSS Variables
```css
--primary-color: #3b82f6
--secondary-color: #10b981
--danger-color: #ef4444
--dark-color: #1f2937
--light-color: #f3f4f6
--border-radius: 8px
--transition: all 0.3s ease
```

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test:coverage

# UI mode
npm run test:ui
```

## Performance Optimization

- Code splitting with React Router
- Lazy loading of components
- Memoization of expensive computations
- Image optimization
- CSS optimization
- Build size optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Deployment

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Vercel/Netlify
```bash
npm run build
```

Deploy the `dist/` folder.

## Security Considerations

- JWT tokens stored in localStorage
- CORS configured for API calls
- XSS protection via React's default escaping
- CSRF protection via state validation
- Secure password requirements enforced

## Known Limitations

- Offline mode not implemented
- Real-time updates not implemented
- WebSocket support pending

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Write tests for new features
3. Follow TypeScript strict mode
4. Format code: `npm run format`
5. Submit pull request

## License

MIT
