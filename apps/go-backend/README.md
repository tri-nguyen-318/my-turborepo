# My Go Project

A simple Go HTTP API with Docker support and automated deployment to Google Cloud Run.

## Prerequisites

- **Go** 1.25 ([Download](https://go.dev/dl/))
- **Docker** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/tri-nguyen-318/my-go-project.git
cd my-go-project
```

### 2. Setup Git Hooks (First Time Only)

```bash
git config core.hooksPath .githooks
```

This enables automatic code formatting and testing before commits.

### 3. Run Locally

#### Option A: Direct Go

```bash
go run main.go
```

Server starts on `http://localhost:3000`

#### Option B: Docker

```bash
make build-run
```

Server starts on `http://localhost:8080`

## API Documentation

### Swagger UI (Interactive)

View interactive API documentation at:

**Local**: `http://localhost:3000/swagger/index.html`

Features:

- 📚 Interactive API explorer
- 🧪 Try endpoints directly in browser
- 📋 View request/response schemas
- 🔍 Search operations

---

## API Endpoints

### Home

```bash
curl http://localhost:3000/
# Response: {"message":"Welcome to Hello World API","routes":["/api/users","/api/users/greet"]}
```

### Get All Users

```bash
curl http://localhost:3000/api/users
# Response: [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"},{"id":3,"name":"Charlie"}]
```

### Greet

```bash
curl "http://localhost:3000/api/users/greet?name=John"
# Response: {"message":"Hello, John!"}
```

## Swagger Documentation

### Regenerating Swagger Docs

When you modify Swagger comments in your code (in handlers or main.go), regenerate the documentation:

```bash
make swagger
```

This command:

1. ✅ Regenerates `docs/docs.go` (Go code with embedded spec)
2. ✅ Regenerates `docs/swagger.json` (OpenAPI spec)
3. ✅ Removes `swagger.yaml` (keeping only JSON)

### What These Files Do

- **`docs/docs.go`** - Auto-generated Go code that embeds the OpenAPI spec. Used by the Swagger UI handler.
- **`docs/swagger.json`** - Raw OpenAPI 3.0 specification in JSON format. Used by Swagger UI and tools.

Both files are **auto-generated** - never edit them manually. Edit the Swagger comments in your code instead.

### Swagger Comments Format

```go
// GetUsers godoc
// @Summary      Get all users
// @Description  Returns a list of all users in the system
// @Tags         users
// @Produce      json
// @Success      200  {array}   dto.UserDTO
// @Failure      500  {object}  map[string]string
// @Router       /api/users [get]
func (h *UserHandler) GetUsers(w http.ResponseWriter, r *http.Request) {
    // ...
}
```

After modifying comments, run `make swagger` to regenerate docs.

## Development

### Format Code

```bash
make format
```

Automatically formats and organizes imports.

### Run Tests

```bash
go test -v ./...
```

Tests run automatically before each commit via git hook.

### Watch & Auto-Restart

Start the server with file watcher that auto-restarts on code changes:

```bash
make watch
```

This uses **air** to:

- 🔄 Watch for `.go` file changes
- 🔄 Auto-rebuild and restart server
- 🎨 Show colored output
- 🛑 Stop on build errors

Press `Ctrl+C` to stop.

### Available Make Commands

```bash
make help
```

Output:

```
make build          - Build Docker image locally
make run            - Run Docker container locally (port 8080)
make stop           - Stop running container
make build-run      - Build and run locally
make format         - Format and organize imports
```

## Project Architecture (DDD)

This project uses **Domain-Driven Design (DDD)** with 4 layers:

### Layer Structure

```
domain/                    ← Pure business logic (zero external deps)
  entity/
    user.go               # User entity
  repository/
    user_repository.go    # Data access interface

application/              ← Use cases & DTOs
  dto/
    user_dto.go          # Data transfer objects
  usecase/
    user_usecase.go      # Business logic orchestration
    user_usecase_test.go # Tests with mock repo

infrastructure/           ← Data persistence
  persistence/
    inmemory_user_repository.go # In-memory data store

interfaces/http/          ← HTTP delivery layer
  handler/
    user_handler.go      # HTTP handlers (with Swagger)
    user_handler_test.go # Handler tests
  router/
    router.go            # Route registration

main.go                   # Composition root (wires all layers)
docs/
  docs.go                 # Generated Swagger (auto-generated)
  swagger.json            # OpenAPI spec (auto-generated)
```

### Dependency Flow

```
main.go
  ├→ infrastructure (creates repositories)
  ├→ application (creates use cases)
  ├→ interfaces/http (creates handlers)
  └→ interfaces/http/router (registers routes)

interfaces/http/handler → application/usecase (interface only)
application/usecase → domain/repository (interface only)
infrastructure → domain only
domain → zero project imports
```

### Key Design Patterns

- **Dependency Inversion**: Code depends on interfaces, not concrete implementations
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Easy to mock dependencies using interfaces
- **Scalability**: Easy to add new domains (e.g., Product, Order) following same structure

### File Structure

```
.
├── domain/               # Business entities & rules
├── application/          # Use cases & DTOs
├── infrastructure/       # Data access implementations
├── interfaces/http/      # HTTP handlers & routing
├── docs/                 # Auto-generated Swagger docs
├── main.go              # Composition root
├── Dockerfile           # Multi-stage Docker build
├── Makefile             # Development commands
├── go.mod / go.sum      # Go dependencies
├── API.md               # API documentation
├── README.md            # This file
└── .githooks/           # Git hooks
    ├── pre-commit       # Auto-format & test before commit
    └── setup.sh         # Setup git hooks
```

## Git Workflow

1. **Make changes**

   ```bash
   # Edit your code
   ```

2. **Pre-commit Hook** (automatic)
   - Formats code with `gofmt` and `goimports`
   - Runs all tests
   - Auto-stages formatted files

3. **Commit**

   ```bash
   git commit -m "Your message"
   ```

4. **Push**

   ```bash
   git push origin main
   ```

5. **GitHub Actions** (automatic)
   - Lints code
   - Runs tests
   - Checks formatting

6. **Cloud Run** (automatic)
   - Builds Docker image
   - Deploys to production

## Bypass Git Hooks (if needed)

```bash
git commit --no-verify -m "Your message"
```

## Troubleshooting

### Port Already in Use

If port 3000 or 8080 is already in use:

```bash
# Kill existing process
make stop

# Or manually
lsof -i :3000  # View process
kill -9 <PID>  # Kill process
```

### Tests Failing Locally

```bash
# Clean Go cache
go clean -testcache

# Run tests again
go test -v ./...
```

### Docker Issues

```bash
# Clean up Docker
docker system prune

# Rebuild image
make build
```

## Deployment

This project is automatically deployed to **Google Cloud Run** when you push to `main`.

### View Deployment URL

```bash
gcloud run services describe my-go-project \
  --region us-central1 \
  --format='value(status.url)'
```

### View Logs

```bash
gcloud run services logs read my-go-project \
  --region us-central1 \
  --limit 50
```

## Contributing

1. Create a feature branch
2. Make changes
3. Git hooks will format and test automatically
4. Push to GitHub
5. GitHub Actions will lint and test
6. Cloud Run will deploy on success

## License

MIT
