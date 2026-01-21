# MCP Explorer

A modern, full-stack application for exploring and interacting with Model Context Protocol (MCP) servers. MCP Explorer provides a user-friendly interface to connect to MCP servers, discover available tools, and execute them with custom parameters.

## 🚀 Features

- **Easy MCP Server Connection**: Connect to any MCP server via STDIO protocol
- **Tool Discovery**: Automatically list all available tools from connected servers
- **Interactive Tool Execution**: Execute tools with custom arguments and view results
- **Real-time Status Monitoring**: Monitor connection status in real-time
- **Modern UI**: Built with Next.js and React for a smooth user experience
- **REST API**: Comprehensive REST API for programmatic access
- **Docker Support**: Easy deployment with Docker Compose
- **CORS Enabled**: Full CORS support for cross-origin requests

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start with Docker Compose](#-quick-start-with-docker-compose)
- [Manual Setup](#-manual-setup)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Frontend Usage](#-frontend-usage)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture

MCP Explorer follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│           Next.js Frontend (React)              │
│           (Port 3000)                           │
└─────────────────┬───────────────────────────────┘
                  │ HTTP Requests
                  │
┌─────────────────▼───────────────────────────────┐
│         FastAPI Backend (Python)                │
│         (Port 8000)                             │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐   ┌──────▼──────────┐
│  MCP Clients   │   │ Connection      │
│  (STDIO)       │   │ Manager         │
└────────────────┘   └─────────────────┘
        │
        └─────────────────────┬─────────────────┐
                              │                 │
                      ┌───────▼────────┐  ┌────▼──────────┐
                      │  MCP Server 1  │  │  MCP Server 2 │
                      └────────────────┘  └───────────────┘
```

For detailed architecture information, see [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md).

## 🛠️ Technology Stack

### Backend
- **Python 3.13+**: Modern Python runtime
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **MCP SDK (1.25.0+)**: Official Model Context Protocol library

### Frontend
- **Next.js**: React framework with server-side rendering
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI component library
- **React Hook Form**: Flexible form handling

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Ruff**: Python linter and formatter

## 📦 Prerequisites

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

OR for manual setup:
- **Python 3.13+**
- **Node.js 18+**
- **npm** or **pnpm**

## 🐳 Quick Start with Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-explorer.git
cd mcp-explorer
```

### 2. Start the Application

```bash
docker-compose up -d
```

This will start:
- **Frontend**: Available at http://localhost:3000
- **Backend API**: Available at http://localhost:8000

### 3. Verify Services Are Running

```bash
docker-compose ps
```

You should see:
```
NAME                        STATUS
mcp-explorer-frontend       Up
mcp-explorer-backend        Up
```

### 4. Access the Application

- **Web Interface**: Open http://localhost:3000 in your browser
- **API Documentation**: Visit http://localhost:8000/docs

### 5. Stop the Application

```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## 🔧 Manual Setup

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment** (optional but recommended):
   ```bash
   python3.13 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -e .
   ```

4. **Run the development server**:
   ```bash
   python main.py
   ```

   Or with Uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
mcp-explorer/
├── backend/                      # Python FastAPI application
│   ├── main.py                  # Application entry point
│   ├── pyproject.toml           # Python dependencies
│   ├── Dockerfile               # Backend container config
│   ├── ARCHITECTURE.md          # Detailed architecture docs
│   │
│   └── src/
│       ├── factory.py           # FastAPI app factory
│       ├── lifespan.py          # App lifecycle events
│       ├── exceptions.py        # Global exceptions
│       │
│       ├── api/                 # API layer
│       │   ├── dependencies.py  # FastAPI dependencies
│       │   ├── schemas.py       # Request/response models
│       │   └── endpoints/
│       │       └── stdio.py     # STDIO connection endpoints
│       │
│       ├── mcp/                 # MCP integration
│       │   ├── manager.py       # Connection manager
│       │   ├── exceptions.py    # MCP-specific exceptions
│       │   ├── client/          # MCP client implementations
│       │   │   ├── base.py      # IMCPClient protocol
│       │   │   ├── stdio.py     # STDIO client
│       │   │   └── http.py      # HTTP client (planned)
│       │   └── connection/      # Connection models
│       │       ├── connection.py
│       │       ├── config.py
│       │       └── type.py
│       │
│       └── utils/               # Utilities
│           └── logging/
│
├── frontend/                     # Next.js React application
│   ├── package.json             # Node dependencies
│   ├── Dockerfile               # Frontend container config
│   ├── next.config.mjs          # Next.js configuration
│   ├── tsconfig.json            # TypeScript config
│   │
│   ├── app/                     # Next.js app directory
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── mcp-explorer.tsx     # Main explorer component
│   │   ├── connection-sidebar.tsx
│   │   ├── tools-panel.tsx
│   │   ├── results-panel.tsx
│   │   └── ui/                  # Radix UI components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── use-mcp-connection.ts # MCP connection hook
│   │
│   ├── lib/                     # Utilities
│   │   ├── types.ts             # TypeScript types
│   │   └── utils.ts             # Helper functions
│   │
│   └── public/                  # Static assets
│
├── test-server/                 # Example MCP test server
│   ├── main.py
│   ├── tools.py
│   └── pyproject.toml
│
├── docker-compose.yml           # Docker Compose configuration
└── README.md                    # This file
```

## 📡 API Endpoints

### Root
- `GET /` - API information

### MCP STDIO Operations

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| `POST` | `/mcp/stdio/connect`    | Connect to an MCP server |
| `POST` | `/mcp/stdio/disconnect` | Disconnect from server   |
| `GET`  | `/mcp/stdio/status`     | Get connection status    |
| `GET`  | `/mcp/stdio/list-tools` | List available tools     |
| `POST` | `/mcp/stdio/execute`    | Execute a tool           |

### Documentation
- `GET /docs` - Swagger UI (interactive)
- `GET /redoc` - ReDoc documentation
- `GET /openapi.json` - OpenAPI schema

## 💻 Frontend Usage

### Connecting to an MCP Server

1. Open http://localhost:3000
2. Use the connection sidebar to create a new connection
3. Provide server details:
   - **Name**: Connection identifier
   - **Command**: The executable (e.g., `python`)
   - **Args**: Command arguments (e.g., `-m my_mcp_server`)
   - **Environment**: Optional environment variables

4. Click "Connect"

### Executing Tools

1. Once connected, the available tools appear in the tools panel
2. Select a tool to see its input schema
3. Fill in the required parameters
4. Click "Execute"
5. View results in the results panel

## 🚀 Development

### Backend Development

1. **Start development server**:
   ```bash
   cd backend
   python main.py
   ```

2. **Run linter/formatter**:
   ```bash
   ruff check .
   ruff format .
   ```

3. **Access API documentation**: http://localhost:8000/docs

### Frontend Development

1. **Start development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Run linter**:
   ```bash
   npm run lint
   ```

### Code Quality

The project enforces code quality standards:

**Backend (Ruff)**:
- Line length: 79 characters (PEP 8)
- Target: Python 3.13
- Enabled rules: pycodestyle, pyflakes, pep8-naming, pydocstyle, pyupgrade, isort, flake8-bugbear, flake8-comprehensions, flake8-simplify

## 🐛 Troubleshooting

### Containers won't start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose build --no-cache

# Start again
docker-compose up
```

### Backend connection errors

Ensure the backend is running and accessible:
```bash
curl http://localhost:8000/
```

### Frontend can't connect to backend

1. Verify backend is running: `http://localhost:8000`
2. Check CORS settings in `backend/src/factory.py`
3. Ensure both services are on the same Docker network

### MCP Server connection issues

1. Verify the MCP server command is correct
2. Check server logs in the results panel
3. Ensure all required dependencies are installed

### Port conflicts

If ports 3000 or 8000 are in use:

**Option 1**: Stop other services using those ports
```bash
lsof -i :3000  # Check port 3000
lsof -i :8000  # Check port 8000
```

**Option 2**: Modify `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Changed to 3001
  backend:
    ports:
      - "8001:8000"  # Changed to 8001
```

## 📚 Additional Resources

- [Backend Architecture Documentation](backend/ARCHITECTURE.md)
- [Backend README](backend/README.md)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Future Enhancements

- [ ] Connection persistence and history
- [ ] Authentication and authorization
- [ ] HTTP/SSE MCP client support
- [ ] Connection pooling
- [ ] Performance metrics and monitoring
- [ ] Tool execution templates
- [ ] Result export functionality

---

**Happy exploring! 🚀**
