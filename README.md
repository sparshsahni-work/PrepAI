# PrepAI

> AI-powered interview coaching — from resume to confident candidate in under a minute.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-informational)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)
![Deployed](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-brightgreen)

---

## What is PrepAI?

PrepAI takes your resume and a job description and generates a complete, personalized interview strategy in under a minute. No generic tips — everything is tailored to the exact role you're applying for.

---

## Features

- **Match Score** — See how well your profile aligns with the job description before you even apply.
- **Technical Questions** — Role-specific questions with the interviewer's intention and a model answer for each.
- **Behavioral Questions** — STAR-method answers built from your own background and experience.
- **Preparation Roadmap** — A day-by-day study plan so you know exactly what to focus on leading up to your interview.
- **Skill Gap Analysis** — Instantly see which skills you're missing and how critical each gap is.
- **AI Resume PDF** — Download a polished, ATS-friendly resume tailored to the specific role.
- **Job Matching** — Discover relevant remote jobs and internships matched to your resume.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express v5 |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (HTTP-only cookies) + token blacklisting |
| AI | Google Gemini (`@google/genai`) |
| PDF Generation | Puppeteer |
| Resume Parsing | `pdf-parse` |
| Job Scraping | Remotive API, Arbeitnow API |
| Security | Helmet, express-rate-limit, bcryptjs |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Routing | React Router v7 |
| Styling | SCSS |
| HTTP Client | Axios |
| State | React Context API |

### Deployment
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # auth, interview, job controllers
│   │   ├── middlewares/     # auth, error, file upload
│   │   ├── models/          # User, InterviewReport, Blacklist
│   │   ├── routes/          # auth, interview, job routes
│   │   ├── services/        # AI service (Gemini + Puppeteer)
│   │   └── app.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── features/
        │   ├── auth/        # Login, Register, context, hooks
        │   ├── interview/   # Home, Interview page, context, hooks
        │   └── jobs/        # Apply page
        ├── Pages/           # Landing page
        └── App.jsx
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB URI (Atlas or local)
- Google Gemini API key

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_gemini_api_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3000
```

```bash
npm run dev
```

---

## API Reference

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login with email + password | Public |
| GET | `/api/auth/logout` | Logout and invalidate token | Public |
| GET | `/api/auth/get-me` | Get current user details | Private |

### Interview
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/interview/` | Generate an interview report | Private |
| GET | `/api/interview/` | Get all reports for logged-in user | Private |
| GET | `/api/interview/report/:id` | Get a specific report by ID | Private |
| POST | `/api/interview/resume/pdf/:id` | Generate and download resume PDF | Private |

### Jobs
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/v1/jobs` | Find matching jobs from resume | Private |

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Port the backend server runs on |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `GOOGLE_GENAI_API_KEY` | Google Gemini API key |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL for CORS |
| `VITE_BACKEND_URL` | Backend URL used by the frontend |

---

## Known Limitations

- PDF generation via Puppeteer requires `--no-sandbox` flags when deployed on Render.
- Job scraping is limited to Remotive and Arbeitnow APIs — scraping-based sources are blocked on Render's free tier.
- The token blacklist has no TTL index, so expired tokens accumulate in the database over time.

---
