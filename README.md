# SportsMatch — Local Sports & Indoor Games Partner Finder

A full-stack web application for finding nearby game partners for indoor and outdoor games like chess, carrom, badminton, table tennis, and more.

---

## Project Structure

```
sportsmatch/
├── backend/          # Node.js + Express REST API
│   ├── config/       # DB connection
│   ├── middleware/   # JWT auth middleware
│   ├── models/       # Mongoose User model
│   ├── routes/       # Auth & user routes
│   └── server.js     # Entry point
└── frontend/         # React.js SPA
    └── src/
        ├── context/  # Auth state (React Context + useReducer)
        ├── pages/    # Login, Register, Dashboard, Profile
        ├── components/ # PrivateRoute
        └── utils/    # Axios instance
```

---

## Features (Phase 1 — Auth & Profiles)

- User registration with 2-step form (account + preferences)
- JWT-based login / logout
- Protected routes via PrivateRoute component
- Full profile management:
  - Name, email, phone, city
  - Preferred games (chess, carrom, cards, badminton, table tennis, cricket, football, volleyball)
  - Skill level (beginner / intermediate / advanced)
  - Availability (days + time slots)
  - Preferred venues (home, society clubhouse, local ground, sports complex)
  - Bio
- Dashboard with profile completeness indicator and stats
- Admin: list all users (paginated)

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Axios  |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB (Mongoose ODM)            |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| Validation | express-validator                 |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (or a MongoDB Atlas URI)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

The React app proxies `/api` requests to `http://localhost:5000` automatically.

---

## API Endpoints

### Auth
| Method | Endpoint             | Access  | Description           |
|--------|----------------------|---------|-----------------------|
| POST   | /api/auth/register   | Public  | Register new user     |
| POST   | /api/auth/login      | Public  | Login, returns token  |
| GET    | /api/auth/me         | Private | Get current user      |
| POST   | /api/auth/logout     | Private | Logout                |

### Users
| Method | Endpoint                   | Access  | Description             |
|--------|----------------------------|---------|-------------------------|
| GET    | /api/users/profile         | Private | Get own profile         |
| PUT    | /api/users/profile         | Private | Update own profile      |
| PUT    | /api/users/change-password | Private | Change password         |
| GET    | /api/users/:id             | Private | Get another user's profile |
| DELETE | /api/users/profile         | Private | Deactivate account      |
| GET    | /api/users                 | Admin   | List all users (paged)  |

---

## Next Steps (Phase 2)

- Matchmaking engine with location-based search
- Play request system (send, accept, decline)
- Community/organizer groups
- Admin dashboard UI
- In-app notifications
