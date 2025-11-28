# Tene Yie - Backend Setup

## Overview

This is the backend API for the Visual Workflow Builder. It handles:
- Storing and retrieving workflows
- Managing nodes (blocks) and edges (connections)
- Storing workflow execution history
- Providing REST API endpoints for the frontend

## Tech Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework for handling HTTP requests
- **Supabase**: PostgreSQL database with easy API
- **Dotenv**: Environment variable management

## Prerequisites

Before starting, you need:
1. **Node.js** installed (download from nodejs.org)
2. **Supabase account** (free at supabase.com)
3. **Git** (for version control)

## Setup Instructions

### Step 1: Clone & Install

```bash
# Clone your repository or create new project
cd workflow-builder-backend

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Go to **Settings → API** and copy:
   - Project URL (SUPABASE_URL)
   - Anon Public Key (SUPABASE_KEY)
4. Go to **SQL Editor** and run the database schema provided

### Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

2. **Never commit `.env` to GitHub** - add to `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### Step 4: Run the Server

```bash
# Development mode (auto-restarts on code changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ Server running on http://localhost:5000
📝 Test it: http://localhost:5000/api/health
```

## Testing the API

### Test 1: Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{ "status": "Server is running!" }
```

### Test 2: Create a Workflow

```bash
curl -X POST http://localhost:5000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Briefing",
    "description": "Get weather and calendar"
  }'
```

### Test 3: Get All Workflows

```bash
curl http://localhost:5000/api/workflows
```

### Test 4: Get Single Workflow

```bash
curl http://localhost:5000/api/workflows/{workflow-id}
```

(Replace `{workflow-id}` with the ID from Test 2)

## API Endpoints

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows` | Create new workflow |
| GET | `/api/workflows` | Get all workflows |
| GET | `/api/workflows/:id` | Get specific workflow with nodes & edges |
| PUT | `/api/workflows/:id` | Update workflow |
| DELETE | `/api/workflows/:id` | Delete workflow |

### Request/Response Examples

**Create Workflow:**
```json
POST /api/workflows
{
  "name": "Daily Briefing",
  "description": "Morning summary with weather and news"
}

Response:
{
  "message": "Workflow created successfully",
  "workflow": {
    "id": "uuid-here",
    "name": "Daily Briefing",
    "description": "...",
    "enabled": true,
    "created_at": "2025-01-15T10:00:00",
    "updated_at": "2025-01-15T10:00:00"
  }
}
```

## Understanding the Code Structure

```
workflow-builder-backend/
├── src/
│   ├── index.js                 # Main server file
│   ├── controllers/
│   │   └── workflowController.js # Business logic
│   ├── routes/
│   │   └── workflowRoutes.js    # API endpoints
│   └── utils/
│       └── supabaseClient.js    # Database connection
├── .env                         # Environment variables (DON'T COMMIT)
├── .gitignore
├── package.json
└── README.md
```

### How It Works (Request Flow)

1. **Frontend** sends HTTP request to `/api/workflows`
2. **Express** receives request and matches it to a route
3. **Route** (`workflowRoutes.js`) calls appropriate controller function
4. **Controller** (`workflowController.js`) contains the logic
5. **Controller** queries **Supabase** database
6. **Response** sent back as JSON to frontend

## Key Concepts

### Async/Await
Allows waiting for database operations:
```javascript
const { data, error } = await supabase.from('workflows').select('*');
```

### Error Handling
Always use try/catch:
```javascript
try {
  // database operation
} catch (err) {
  // handle error
}
```

### CORS
Allows your React frontend to communicate with this Node.js backend:
```javascript
app.use(cors({ origin: 'http://localhost:3000' }));
```

## Common Issues

### "Cannot find module 'express'"
Solution: Run `npm install`

### "SUPABASE_URL is undefined"
Solution: Check `.env` file exists with correct values

### Port 5000 already in use
Solution: Kill process or change PORT in `.env`

## Next Steps

1. ✅ Create Node endpoints for **Nodes** (triggers, actions, data sources)
2. ✅ Create Edge endpoints (connections between nodes)
3. ✅ Build Execution Engine (runs workflows)
4. ✅ Add Authentication (optional)
5. ✅ Create React frontend

## Useful Resources

- [Express.js Docs](https://expressjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Node.js Beginner Guide](https://nodejs.org/en/docs/guides/getting-started-guide/)
- [RESTful API Basics](https://restfulapi.net/)

## Questions?

Refer to the code comments - each function is heavily documented to help you learn!