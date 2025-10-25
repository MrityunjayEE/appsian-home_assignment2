# Mini Project Manager

A complete project management system with task scheduling capabilities.

## Tech Stack

**Backend**: C# .NET 8, Entity Framework Core, SQLite, JWT Auth
**Frontend**: React TypeScript, Vite, React Router, Tailwind CSS

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Git

### Backend Setup

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

Backend runs on `https://localhost:7001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (.env or appsettings.Development.json)
```json
{
  "JwtSettings": {
    "SecretKey": "your-super-secret-jwt-key-minimum-32-characters-long",
    "ExpiryHours": 24
  }
}
```

### Demo User
- Username: `demo@example.com`
- Password: `Demo123!`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `DELETE /api/projects/{id}` - Delete project

### Tasks
- `POST /api/projects/{projectId}/tasks` - Create task
- `PUT /api/tasks/{taskId}` - Update task
- `DELETE /api/tasks/{taskId}` - Delete task

### Smart Scheduler
- `POST /api/v1/projects/{projectId}/schedule` - Generate task schedule

## Testing

```bash
# Backend tests
cd backend
dotnet test

# Frontend tests
cd frontend
npm test
```

## Docker (Optional)

```bash
docker-compose up --build
```

## API Documentation

Swagger UI available at: `https://localhost:7001/swagger`

## Project Structure

```
├── backend/                 # .NET 8 Web API
│   ├── Controllers/         # API Controllers
│   ├── Models/             # Entity Models
│   ├── DTOs/               # Data Transfer Objects
│   ├── Services/           # Business Logic Services
│   ├── Data/               # Database Context & Migrations
│   └── ProjectManager.Tests/ # Unit Tests
├── frontend/               # React TypeScript App
│   ├── src/
│   │   ├── components/     # React Components
│   │   ├── contexts/       # React Contexts
│   │   ├── services/       # API Services
│   │   └── types/          # TypeScript Types
│   └── public/
├── docker-compose.yml      # Docker Configuration
└── api_requests.http       # API Test Requests
```

## Features Implemented

✅ User registration and JWT authentication
✅ Project CRUD operations with ownership validation
✅ Task management within projects
✅ Smart scheduler with dependency resolution
✅ Cycle detection in task dependencies
✅ Responsive React frontend with Tailwind CSS
✅ Form validation on both client and server
✅ Unit tests for backend services
✅ Docker containerization
✅ Swagger API documentation
✅ Database migrations and seed data

## Development Notes

- JWT tokens are stored in localStorage
- SQLite database is used for simplicity
- CORS is configured for frontend-backend communication
- All API endpoints require authentication except auth endpoints
- Users can only access their own projects and tasks
- Scheduler provides deterministic task ordering and scheduling
