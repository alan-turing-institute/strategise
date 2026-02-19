# Docker Quick Start Guide

## What is Docker?

Docker creates lightweight, isolated containers that package your entire application (code, dependencies, system packages) into a single unit that runs the same way on any machine.

## Prerequisites

1. **Install Docker Desktop**
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Available for macOS, Windows, and Linux
   - Create a free Docker account during installation

2. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

## Quick Start (2 minutes)

```bash
# 1. Navigate to the project directory
cd /path/to/game

# 2. Start everything with one command
docker-compose up --build

# 3. Open your browser to http://localhost:5173
```

That's it! The app will be running with:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Common Commands

MAC USERS: Replace `docker-compose` in the commands below with `docker compose`.

### Start the containers (subsequent times - no rebuild)
```bash
docker-compose up
```

### Stop the containers
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f web      # Frontend logs
docker-compose logs -f api      # Backend logs
docker-compose logs -f          # All logs
```

### Rebuild after dependency changes (new packages)
```bash
docker-compose up --build
```

### Remove containers and volumes
```bash
docker-compose down -v
```

## What Gets Installed?

The Docker containers automatically include:

**Backend Container (api):**
- Python 3.11
- LaTeX (texlive-full) ~1.5GB
- pdf2svg
- All Python packages from `requirements.txt`

**Frontend Container (web):**
- Node.js 18
- npm packages from `package.json`

## Troubleshooting

### "Port already in use"
Another app is using port 5173 or 5000
```bash
# Change ports in docker-compose.yml:
# ports:
#   - "5174:5173"  # Use 5174 instead
#   - "5001:5000"  # Use 5001 instead
```

### "Out of disk space"
LaTeX is ~1.5GB. Ensure you have at least 5GB free
```bash
# Check disk space
docker system df
```

### "Containers won't start"
```bash
# Clean up and rebuild
docker-compose down -v
docker-compose up --build
```

### "Code changes not showing"
Hot-reload is enabled. Wait a few seconds for the dev server to recompile.

## Storage Note

⚠️ First build: ~2-3 minutes (downloads LaTeX)
✅ Subsequent starts: < 5 seconds (cached)

Total disk space used: ~3-4GB

## Next Steps

See the main [README.md](README.md) for more information about the application structure and features.
