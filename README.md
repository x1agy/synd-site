# SyndSite

A full-stack application with React frontend and Node.js backend.

## Deployment on Railway

This project is configured for deployment on Railway with separate frontend and backend services.

### Setup

1. **Connect Repository**: Link this GitHub repo to your Railway project
2. **Environment Variables**: Set the following in Railway dashboard:
   - `CONTRACTS_SHEET_ID` - Your Google Sheets ID for contracts
   - `GOOGLE_API` - Your Google API credentials JSON
   - `PORT` - Will be set automatically by Railway

### Services

- **Frontend**: React/Vite app served on port 4173 (preview)
- **Backend**: Express API server on port 3001

### Configuration

The `railway.toml` file defines:

- Build commands for each service
- Health checks
- Environment variables
- Restart policies

### Manual Deployment

If you prefer deploying services separately:

1. **Backend Only**: Use the `server/` folder
2. **Frontend Only**: Build with `npm run build` and serve `dist/` folder

### Health Check

Backend includes `/api/health` endpoint for Railway health monitoring.
