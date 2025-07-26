# Development Setup and Getting Started

This guide helps new developers get the MLOps Platform running locally and understand the development workflow.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Docker** and Docker Compose (recommended)
- **Git** for version control

### Option 1: Docker Development (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd mlops-platform

# Start all services
docker-compose up -d

# Frontend will be available at http://localhost:3000
# Backend API at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Option 2: Local Development
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
mlops-platform/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   └── types/           # TypeScript definitions
│   ├── Dockerfile
│   └── package.json
├── backend/                  # FastAPI Python application
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Configuration
│   │   ├── models/         # Database models (planned)
│   │   └── services/       # Business logic (planned)
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── docs/                    # Documentation
└── docker-compose.yml      # Multi-service setup
```

## 🛠️ Development Workflow

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Backend Development
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload

# View API documentation
# Open http://localhost:8000/docs
```

### Code Quality
```bash
# Frontend
npm run lint          # ESLint
npm run type-check    # TypeScript

# Backend
# (Add when implemented)
# black .              # Code formatting
# flake8 .             # Linting
# mypy .               # Type checking
```

## 🔧 Available Scripts

### Frontend (`frontend/package.json`)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Backend
- `uvicorn app.main:app --reload` - Start development server
- `alembic upgrade head` - Run database migrations (when implemented)

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Alternative API docs |

## 📝 Current Implementation Status

### ✅ Working Features
- Frontend application with routing
- Authentication UI (login/register pages)
- Backend API structure with all endpoints defined
- Docker containerization
- CORS configuration
- TypeScript type safety

### ⏳ In Development
- Authentication implementation (JWT tokens)
- Database integration (PostgreSQL)
- Real API connections
- User management

### 📋 Planned Features
- Model registry
- Experiment tracking
- Deployment management
- Monitoring and alerting

## 🐛 Common Issues

### Frontend Issues
```bash
# Clear Next.js cache if you see module errors
rm -rf .next
npm install
npm run dev
```

### Backend Issues
```bash
# If you see import errors
pip install -r requirements.txt

# Check if the server is running
curl http://localhost:8000/health
```

### Docker Issues
```bash
# Rebuild containers if needed
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔍 Debugging

### Frontend Debugging
- Use browser DevTools
- Check console for errors
- Use React DevTools extension
- TypeScript errors shown in terminal

### Backend Debugging
- Check terminal output for errors
- Use FastAPI automatic docs at `/docs`
- Add print statements or logging
- Use Python debugger (`pdb`)

## 📚 Learning Resources

### Technologies Used
- **Frontend:** [Next.js](https://nextjs.org/docs), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/docs/), [Tailwind CSS](https://tailwindcss.com/docs)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://docs.sqlalchemy.org/), [Alembic](https://alembic.sqlalchemy.org/)
- **Tools:** [Docker](https://docs.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

### Project-Specific Docs
- [System Architecture](../technical/01-system-architecture.md)
- [API Design](../technical/03-api-design.md)
- [ADR Documents](./decisions/)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally (both frontend and backend)
4. Ensure code quality checks pass
5. Create a pull request

## 💡 Tips

- Use TypeScript strictly - it catches errors early
- Follow the established patterns in existing code
- Update documentation when adding new features
- Test your changes in both development and production builds
- Use meaningful commit messages