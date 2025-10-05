## Bookish -- A Comprehensive Book Review Platform

### Project Overview

A full-stack Book Review application with:

- **Backend:** Developed using Node.js, Express, MongoDB, Mongoose schemas, bcrypt, JWT, MVC structure Located in `/backend`.

- **Frontend:** Developed using React Router, Context API, Axios, Tailwind CSS Located in `/frontend`.

---

### Prerequisites (Windows)

- Node.js LTS (v18 or v20 recommended)
- npm (comes with Node.js)
- Git
- PowerShell (or Windows Terminal / CMD)
- A MongoDB Atlas cluster (or other MongoDB URI)
- Vercel account (if deploying)

Optional (for local dev convenience):
- `npx nodemon` (dev server auto-reload)
- Postman or Insomnia for API testing

---

### Quick local setup (step-by-step)

#### 1) Unzip & open project folder

If you have the zip `book-review-platform.zip` in your `Downloads` folder, using PowerShell:

```powershell
cd %USERPROFILE%\Downloads
Expand-Archive -LiteralPath .\book-review-platform.zip -DestinationPath .\book-review-platform
cd .\book-review-platform\book-review-platform
```

> Note: the repository root in the zip is `book-review-platform/`.

#### 2) Backend — install dependencies and run

```powershell
cd backend
# (recommended) delete existing node_modules if present (zip may include them)
Remove-Item -Recurse -Force node_modules
npm install
```

Create a local `.env` file **(do not commit this file)** in `backend/.env` with the following keys (example):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the backend (development):

```powershell
npm run dev
# or
node server.js
```

Server default: `http://localhost:5000` (the code uses that port when `PORT` is 5000).

#### 3) Frontend — install dependencies and run

Open a new PowerShell window/tab:

```powershell
cd path\to\book-review-platform\frontend
Remove-Item -Recurse -Force node_modules
npm install
```

Edit `frontend/.env.local` (or create it) so the React app points to your local API:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```powershell
npm start
```

The CRA app should open at `http://localhost:3000`.

---

### Environment variables reference

**Backend (`backend/.env`)**

- `PORT` — port to run backend locally (default: 5000)
- `MONGO_URI` — MongoDB connection string (e.g. MongoDB Atlas)
- `JWT_SECRET` — secret used to sign JWT tokens (keep private)
- `JWT_EXPIRES_IN` — token expiry (e.g. `7d`)
- `NODE_ENV` — `development` or `production`

**Frontend (`frontend/.env.local`)**

- `REACT_APP_API_URL` — base API URL used by the React app (example: `http://localhost:5000/api` or `https://your-project.vercel.app/api`)

When deploying, set production environment variables using the provider (Vercel dashboard or `vercel env add`).

---

### API Documentation (summary)

All endpoints are prefixed with: `/api` (e.g. `http://localhost:5000/api/...`).

### Authentication

#### POST `/api/auth/signup`
- Create a new user.
- Body (JSON): `{ "name": "...", "email": "...", "password": "..." }`
- Success: `201 Created` -> `{ "user": { ...userWithoutPassword }, "token": "<jwt>" }`

#### POST `/api/auth/login`
- Body: `{ "email": "...", "password": "..." }`
- Success: `200 OK` -> `{ "user": { ... }, "token": "<jwt>" }`

#### GET `/api/auth/me` (protected)
- Header: `Authorization: Bearer <token>`
- Returns the authenticated user's data (without password).

---

### Books

#### GET `/api/books`
- Public, paginated listing.
- Query params (if supported): `page`, `limit`, maybe `search` (check front-end usage).
- Response: `{ "books": [...], "page": 1, "totalPages": X, "totalBooks": N }`

#### GET `/api/books/:id`
- Return a single book object with aggregated rating details.
- Responses: `200 { "book": {...} }` or `404` if not found.

#### POST `/api/books` (protected)
- Create a new book. Header: `Authorization: Bearer <token>`
- Body: `{ title, author, description, genre, year }` (title & author required)
- Response: `201 { "book": {...} }`

#### PUT `/api/books/:id` (protected)
- Update a book that the authenticated user added (authorization enforced).
- Body: fields to update.
- Response: `200 { "book": {...} }` or `403` if not owner.

#### DELETE `/api/books/:id` (protected)
- Delete book (only owner allowed). Response: `{ "message": "Book deleted" }`.

---

### Reviews

#### POST `/api/reviews/:bookId` (protected)
- Add a review to the specified `bookId`.
- Body: `{ rating: 1-5, comment: "optional text" }`.
- Response: `201` with populated review object (includes user and book info) or `400/404` on errors.

#### PUT `/api/reviews/:id` (protected)
- Update your review. Authorization checked.
- Body: fields to update (e.g. `rating`, `comment`).
- Response: updated review.

#### DELETE `/api/reviews/:id` (protected)
- Delete your review. Response: `{ "message": "Review deleted" }`.

#### GET `/api/reviews/user/:userId` (protected)
- Fetch all reviews by a user. Returns `{ "reviews": [...] }`.

---

## Models (short)

- **User**: `{ name, email, password (hashed), timestamps }`.
- **Book**: `{ title, author, description, genre, year, addedBy (User), averageRating, reviewsCount, timestamps }`.
- **Review**: `{ bookId, userId, rating, comment, timestamps }`.

---

## Testing the API (curl examples)

Signup:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret"}'
```

Create a book (protected):

```bash
curl -X POST http://localhost:5000/api/books \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Hobbit","author":"J.R.R. Tolkien"}'
```

Add review:

```bash
curl -X POST http://localhost:5000/api/reviews/<bookId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Loved it"}'
```

---