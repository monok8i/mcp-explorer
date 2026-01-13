# MCP Explorer Backend - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [API Endpoints](#api-endpoints)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Data Flow](#data-flow)
9. [Error Handling](#error-handling)
10. [Development & Deployment](#development--deployment)

---

## Project Overview

**MCP Explorer** is a backend service that acts as a bridge between frontend applications and MCP (Model Context Protocol) servers. It provides a RESTful API to establish connections with MCP servers, manage those connections, and execute tools available on the connected servers.

### Key Features
- Connect to MCP servers via STDIO protocol
- Manage multiple concurrent connections
- List available tools from connected MCP servers
- Execute tools with custom arguments
- Real-time connection status monitoring
- Full CORS support for frontend integration

---

## Technology Stack

### Core Technologies
- **Python 3.13+**: Modern Python with latest features
- **FastAPI**: High-performance web framework
- **Uvicorn**: ASGI server for production
- **Pydantic**: Data validation and settings management
- **MCP SDK (1.25.0+)**: Official Model Context Protocol client library

### Development Tools
- **Ruff**: Fast Python linter and formatter
- **Docker**: Containerization support (planned)

---

## Architecture Overview

The backend follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│              FastAPI Application                │
│              (main.py/factory.py)               │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
┌───────▼────────┐   ┌────────▼──────────┐
│   API Layer    │   │  Lifespan Events  │
│  (endpoints/)  │   │   (lifespan.py)   │
└───────┬────────┘   └───────────────────┘
        │
        ├─── Dependencies (dependencies.py)
        │
┌───────▼────────────────────────────────────────┐
│         MCP Client Layer (mcp/client/)         │
│  - StdioMCPClient (stdio.py)                   │
│  - IMCPClient Protocol (base.py)               │
└───────┬────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────┐
│     Connection Management (mcp/manager.py)     │
│  - ConnectionManager                           │
│  - Connection lifecycle management             │
└───────┬────────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────┐
│    Connection Layer (mcp/connection/)          │
│  - Connection (connection.py)                  │
│  - Configs (config.py)                         │
│  - Types (type.py)                             │
└────────────────────────────────────────────────┘
```

### Design Patterns Used

1. **Factory Pattern**: `create_fastapi()` in `factory.py`
2. **Dependency Injection**: FastAPI's dependency system
3. **Protocol Pattern**: `IMCPClient` interface for extensibility
4. **Manager Pattern**: `ConnectionManager` for connection lifecycle
5. **Context Manager Pattern**: Async context managers for resource management

---

## Project Structure

```
backend/
├── main.py                      # Application entry point
├── pyproject.toml              # Project dependencies and configuration
├── Dockerfile                  # Docker configuration (placeholder)
├── README.md                   # Project README
└── src/
    ├── factory.py              # FastAPI application factory
    ├── lifespan.py             # Application lifecycle events
    ├── exceptions.py           # Global exceptions (empty)
    │
    ├── api/                    # API layer
    │   ├── dependencies.py     # FastAPI dependencies
    │   ├── schemas.py          # Pydantic request/response models
    │   └── endpoints/
    │       ├── __init__.py     # Router aggregation
    │       └── stdio.py        # STDIO connection endpoints
    │
    ├── mcp/                    # MCP integration layer
    │   ├── exceptions.py       # MCP-specific exceptions
    │   ├── manager.py          # Connection manager
    │   │
    │   ├── client/             # MCP client implementations
    │   │   ├── base.py         # IMCPClient protocol
    │   │   ├── stdio.py        # STDIO client implementation
    │   │   └── http.py         # HTTP client (planned)
    │   │
    │   └── connection/         # Connection models and configs
    │       ├── __init__.py     # Exports
    │       ├── connection.py   # Connection dataclass
    │       ├── config.py       # Connection configurations
    │       └── type.py         # Connection types and enums
    │
    └── utils/                  # Utility modules
        └── logging/
            ├── __init__.py
            ├── config.py       # Logging configuration
            └── setup.py        # Logging setup function
```

---

## Core Components

### 1. FastAPI Application (`factory.py`)

The application factory configures and creates the FastAPI instance:

```python
def create_fastapi() -> FastAPI:
    """Create and configure FastAPI application."""

    app = FastAPI(lifespan=register_lifespan_events)
    app.include_router(api_router)  # Mount API routes

    # Initialize connection manager
    app.state.connection_manager = ConnectionManager()

    # Configure CORS for frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app
```

**Key Responsibilities:**
- Route registration
- Middleware configuration
- Application state initialization
- CORS setup for cross-origin requests

### 2. Connection Manager (`mcp/manager.py`)

Manages the lifecycle of MCP server connections:

```python
class ConnectionManager:
    - _sse_connections: dict[str, Connection]
    - _stdio_connections: dict[str, Connection]

    async def create_connection(...)  # Create new connection
    def get_connection(...)           # Retrieve connection by ID
    async def disconnect(...)         # Close and cleanup connection
```

**Features:**
- UUID-based connection identification
- Support for STDIO and SSE (planned) connections
- Automatic session and transport management
- Graceful connection cleanup

### 3. STDIO MCP Client (`mcp/client/stdio.py`)

Implements the MCP client for STDIO-based servers:

```python
class StdioMCPClient(IMCPClient):
    async def connect(...)        # Establish connection
    async def call_tool(...)      # Execute a tool
    async def list_tools(...)     # List available tools
    async def disconnect(...)     # Close connection
    def is_connected(...)         # Check connection status
    def get_connection_info(...)  # Get connection details
```

### 4. Connection Model (`mcp/connection/connection.py`)

Represents an active MCP connection:

```python
@dataclass
class Connection:
    id: str                      # UUID
    name: str                    # User-friendly name
    type: ConnectionType         # STDIO or SSE
    status: str                  # Connection status
    config: Config               # Connection configuration

    @property
    session: ClientSession       # MCP session

    @property
    transport: Transport         # Transport layer

    async def call_tool(...)     # Execute tool
    async def list_tools(...)    # List available tools
```

### 5. API Dependencies (`api/dependencies.py`)

FastAPI dependency injection providers:

```python
# Extract connection ID from header
XConnectionID = Annotated[str, Depends(get_connection_id_from_header)]

# Inject STDIO client
GetStdioMCPClient = Annotated[StdioMCPClient, Depends(get_stdio_client)]
```

---

## API Endpoints

Base URL: `http://localhost:8000`

### Root Endpoint

#### `GET /`
Returns API information.

**Response:**
```json
{
  "message": "MCP Explorer API",
  "version": "1.0.0"
}
```

---

### MCP STDIO Operations

All endpoints under `/mcp/stdio` prefix.

#### 1. Connect to MCP Server

**`POST /mcp/stdio/connect`**

Establishes a connection to an MCP server via STDIO protocol.

**Request Body:**
```json
{
  "name": "my-server",
  "command": "python",
  "args": ["-m", "my_mcp_server"],
  "env": {
    "ENV_VAR": "value"
  }
}
```

**Fields:**
- `name` (string, required): Connection name identifier
- `command` (string, required): Command to execute
- `args` (array, required): Command arguments
- `env` (object, optional): Environment variables

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-server",
  "type": "stdio",
  "status": "connected",
  "config": {
    "command": "python",
    "args": ["-m", "my_mcp_server"],
    "env": {
      "ENV_VAR": "value"
    }
  }
}
```

**Error Response (500):**
```json
{
  "detail": "Error message"
}
```

---

#### 2. Disconnect from MCP Server

**`POST /mcp/stdio/disconnect`**

Closes an active connection to an MCP server.

**Headers:**
- `X-Connection-ID` (required): Connection UUID

**Response (200):**
```json
{
  "success": true
}
```

**Error Response (400):**
```json
{
  "detail": "X-Connection-ID header is required."
}
```

---

#### 3. Get Connection Status

**`GET /mcp/stdio/status`**

Retrieves the current status of a connection.

**Headers:**
- `X-Connection-ID` (required): Connection UUID

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-server",
  "type": "stdio",
  "status": "connected",
  "config": {
    "command": "python",
    "args": ["-m", "my_mcp_server"],
    "env": null
  }
}
```

**Error Response (404):**
```json
{
  "detail": "Connection not found. Please reconnect."
}
```

---

#### 4. List Available Tools

**`GET /mcp/stdio/list-tools`**

Returns all tools available on the connected MCP server.

**Headers:**
- `X-Connection-ID` (required): Connection UUID

**Response (200):**
```json
[
  {
    "name": "get_weather",
    "description": "Get current weather information",
    "inputSchema": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string",
          "description": "City name"
        }
      },
      "required": ["location"]
    },
    "outputSchema": null
  }
]
```

**Fields:**
- `name` (string): Tool identifier
- `description` (string | null): Tool description
- `inputSchema` (object | null): JSON Schema for input validation
- `outputSchema` (object | null): JSON Schema for output (if available)

---

#### 5. Execute a Tool

**`POST /mcp/stdio/execute`**

Executes a tool on the connected MCP server.

**Headers:**
- `X-Connection-ID` (required): Connection UUID

**Request Body:**
```json
{
  "tool_name": "get_weather",
  "arguments": {
    "location": "New York"
  }
}
```

**Response (200):**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Weather in New York: Sunny, 72°F"
    }
  ],
  "isError": false
}
```

**Error Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Error executing tool: Invalid location"
    }
  ],
  "isError": true
}
```

---

## Frontend Integration Guide

### Connection Workflow

```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       │ 1. POST /mcp/stdio/connect
       ├──────────────────────────────►
       │
       │ ◄─────────────────────────────
       │     2. { id, name, ... }
       │
       │ (Store connection ID)
       │
       │ 3. GET /mcp/stdio/list-tools
       │    Header: X-Connection-ID
       ├──────────────────────────────►
       │
       │ ◄─────────────────────────────
       │     4. [{ name, ... }]
       │
       │ 5. POST /mcp/stdio/execute
       │    Header: X-Connection-ID
       ├──────────────────────────────►
       │
       │ ◄─────────────────────────────
       │     6. { content, isError }
       │
       │ 7. POST /mcp/stdio/disconnect
       │    Header: X-Connection-ID
       ├──────────────────────────────►
       │
       │ ◄─────────────────────────────
       │     8. { success: true }
       │
```

### JavaScript/TypeScript Example

```javascript
// 1. Connect to MCP Server
async function connectToMCP() {
  const response = await fetch('http://localhost:8000/mcp/stdio/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'weather-server',
      command: 'python',
      args: ['-m', 'weather_mcp_server'],
      env: {}
    })
  });

  const connection = await response.json();
  // Store connection.id for subsequent requests
  return connection.id;
}

// 2. List Available Tools
async function listTools(connectionId) {
  const response = await fetch('http://localhost:8000/mcp/stdio/list-tools', {
    method: 'GET',
    headers: {
      'X-Connection-ID': connectionId
    }
  });

  return await response.json();
}

// 3. Execute a Tool
async function executeTool(connectionId, toolName, args) {
  const response = await fetch('http://localhost:8000/mcp/stdio/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Connection-ID': connectionId
    },
    body: JSON.stringify({
      tool_name: toolName,
      arguments: args
    })
  });

  return await response.json();
}

// 4. Disconnect
async function disconnect(connectionId) {
  const response = await fetch('http://localhost:8000/mcp/stdio/disconnect', {
    method: 'POST',
    headers: {
      'X-Connection-ID': connectionId
    }
  });

  return await response.json();
}

// Usage
(async () => {
  const connectionId = await connectToMCP();
  const tools = await listTools(connectionId);
  const result = await executeTool(connectionId, 'get_weather', {
    location: 'New York'
  });
  console.log(result);
  await disconnect(connectionId);
})();
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface Connection {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Tool {
  name: string;
  description: string | null;
  inputSchema: object | null;
  outputSchema: object | null;
}

export function useMCPConnection(serverConfig: {
  name: string;
  command: string;
  args: string[];
}) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/mcp/stdio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverConfig)
      });

      if (!response.ok) throw new Error('Connection failed');

      const data = await response.json();
      setConnection(data);

      // Auto-load tools
      await loadTools(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async (connectionId: string) => {
    const response = await fetch('http://localhost:8000/mcp/stdio/list-tools', {
      headers: { 'X-Connection-ID': connectionId }
    });

    const data = await response.json();
    setTools(data);
  };

  const executeTool = async (toolName: string, args: Record<string, any>) => {
    if (!connection) throw new Error('Not connected');

    const response = await fetch('http://localhost:8000/mcp/stdio/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Connection-ID': connection.id
      },
      body: JSON.stringify({
        tool_name: toolName,
        arguments: args
      })
    });

    return await response.json();
  };

  const disconnect = async () => {
    if (!connection) return;

    await fetch('http://localhost:8000/mcp/stdio/disconnect', {
      method: 'POST',
      headers: { 'X-Connection-ID': connection.id }
    });

    setConnection(null);
    setTools([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        disconnect();
      }
    };
  }, [connection]);

  return {
    connection,
    tools,
    loading,
    error,
    connect,
    executeTool,
    disconnect
  };
}
```

---

## Data Flow

### Connection Establishment Flow

```
Frontend                API Layer           Client Layer        Manager           MCP Server
   │                       │                     │                 │                   │
   │ POST /connect         │                     │                 │                   │
   ├──────────────────────►│                     │                 │                   │
   │                       │ get_stdio_client()  │                 │                   │
   │                       ├────────────────────►│                 │                   │
   │                       │                     │ connect()       │                   │
   │                       │                     ├────────────────►│                   │
   │                       │                     │                 │ create_connection │
   │                       │                     │                 ├──────────────────►│
   │                       │                     │                 │   initialize()    │
   │                       │                     │                 │◄──────────────────│
   │                       │                     │◄────────────────│                   │
   │                       │◄────────────────────│                 │                   │
   │◄──────────────────────│                     │                 │                   │
   │  { id, name, ... }    │                     │                 │                   │
```

### Tool Execution Flow

```
Frontend                API Layer           Client Layer        Connection        MCP Server
   │                       │                     │                 │                   │
   │ POST /execute         │                     │                 │                   │
   ├──────────────────────►│                     │                 │                   │
   │  + X-Connection-ID    │ get_connection()    │                 │                   │
   │                       ├────────────────────►│                 │                   │
   │                       │                     │ call_tool()     │                   │
   │                       │                     ├────────────────►│                   │
   │                       │                     │                 │ session.call_tool │
   │                       │                     │                 ├──────────────────►│
   │                       │                     │                 │◄──────────────────│
   │                       │                     │◄────────────────│                   │
   │                       │◄────────────────────│                 │                   │
   │◄──────────────────────│                     │                 │                   │
   │  { content, isError } │                     │                 │                   │
```

---

## Error Handling

### Exception Hierarchy

```python
# MCP-specific exceptions (src/mcp/exceptions.py)

class UnsupportedResponseTypeError(Exception):
    """Response type not supported"""

class UnsupportedConnectionTypeError(Exception):
    """Connection type not supported"""

class MCPClientNotConnectedError(Exception):
    """Client not connected to server"""
```

### HTTP Error Responses

| Status Code | Scenario                       | Response                                                |
| ----------- | ------------------------------ | ------------------------------------------------------- |
| 400         | Missing X-Connection-ID header | `{"detail": "X-Connection-ID header is required."}`     |
| 404         | Connection not found           | `{"detail": "Connection not found. Please reconnect."}` |
| 500         | Server/connection error        | `{"detail": "<error message>"}`                         |

### Frontend Error Handling

```javascript
try {
  const result = await executeTool(connectionId, toolName, args);

  if (result.isError) {
    // Tool execution returned an error
    console.error('Tool error:', result.content);
  } else {
    // Success
    console.log('Result:', result.content);
  }
} catch (error) {
  // HTTP or network error
  if (error.status === 404) {
    // Connection lost, need to reconnect
  } else if (error.status === 500) {
    // Server error
  }
}
```

---

## Development & Deployment

### Local Development

1. **Install Dependencies:**
```bash
# Using uv (recommended)
uv pip install -e .

# Or using pip
pip install -e .
```

2. **Run Development Server:**
```bash
python main.py
```

The server will start at `http://0.0.0.0:8000`

3. **Run with Uvicorn directly:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Code Quality

The project uses **Ruff** for linting and formatting:

```bash
# Check code
ruff check .

# Format code
ruff format .
```

**Ruff Configuration** (from `pyproject.toml`):
- Line length: 79 characters (PEP 8)
- Target: Python 3.13
- Enabled rules: pycodestyle, pyflakes, pep8-naming, pydocstyle, pyupgrade, isort, flake8-bugbear, flake8-comprehensions, flake8-simplify

### Environment Variables

Currently, the application doesn't use environment variables, but you can extend it:

```python
# Create src/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["*"]

    class Config:
        env_file = ".env"
```

### Docker Deployment (Planned)

The `Dockerfile` is currently empty but would typically look like:

```dockerfile
FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install -e .

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

### API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Future Enhancements

### Planned Features

1. **SSE Connection Support** (`mcp/client/http.py`)
   - HTTP-based MCP server connections
   - Server-Sent Events for streaming responses

2. **Connection Persistence**
   - Store connections in database
   - Automatic reconnection on server restart

3. **Authentication & Authorization**
   - API key authentication
   - User-based connection management

4. **WebSocket Support**
   - Real-time connection status updates
   - Streaming tool execution results

5. **Connection Pooling**
   - Reuse connections
   - Connection limits per user

6. **Metrics & Monitoring**
   - Connection statistics
   - Tool execution metrics
   - Performance monitoring

---

## Summary

The MCP Explorer backend is a well-structured FastAPI application that:

✅ Provides a REST API for MCP server interaction
✅ Manages connection lifecycle with UUID-based identification
✅ Supports STDIO-based MCP servers
✅ Offers clean separation of concerns with layered architecture
✅ Includes comprehensive error handling
✅ Enables easy frontend integration with CORS support
✅ Follows Python best practices and PEP 8 guidelines

The architecture is designed for **extensibility** (Protocol pattern for clients), **maintainability** (clear layer separation), and **scalability** (connection manager design).

For frontend developers: Simply make HTTP requests to the documented endpoints, store the connection ID from the initial connect call, and pass it in the `X-Connection-ID` header for all subsequent operations.
