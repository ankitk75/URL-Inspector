# URL Inspector

A full-stack web app to monitor the health of websites, providing real-time status, response times, and analytics.

## Features
- Input multiple URLs (textarea or CSV upload)
- View UP/DOWN status, response times, and last-checked timestamp
- Scheduled automatic health checks
- Analytics: uptime %, response time trends
- Filters (e.g., show only DOWN URLs)

## Tech Stack
- **Frontend:** React, TailwindCSS, Chart.js
- **Backend:** FastAPI, PostgreSQL, Celery, Redis
- **DevOps:** Docker, Docker Compose

## Quick Start

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd url-inspector
   ```
2. **Start all services:**
   ```bash
   docker-compose up --build
   ```
3. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs

---

## Development
- Frontend: `/frontend`
- Backend: `/backend`

See the README sections in each for more details.
