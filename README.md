### Neptune

React/TypeScript client for a sports pool and NFL picks league. Frontend-only—requires a separate API server (REST + GraphQL).

### Features
- **Authentication**: POST /api/login with email/password; JWT stored in localStorage for authorized requests.
- **Protected routes**: Authenticated pages use Layout and Header components.
- **Leagues & Seasons**: Browse leagues and seasons via HomePage, LeagueDetails, SeasonDetails, and LeagueSeasonsPage.
- **Weekly Picks**: Load spreads, current week, and season picks via GraphQL; submit picks with CreateGamePicks mutation.

### Tech Stack
React 19, TypeScript
Create React App 5, React Router 7
Tailwind CSS
GraphQL (graphql-request) & REST (axios)
Prerequisites
Node.js + npm

### Environment Variables
Variable	Default	Role
REACT_APP_API_BASE_URL	http://localhost:8080/api	REST endpoints (login, leagues, etc.)
REACT_APP_GRAPHQL_URL	http://localhost:8080/query	GraphQL queries/mutations

### Scripts
```
npm start – Dev server (http://localhost:3000)
npm run build – Production build
npm test – Jest test runner
```

### Project Structure
src/pages/ – Login, Home, League/Season pages
src/components/ – Layout, Header, League/Season details, Weekly Picks
src/api/ – REST helpers, GraphQL client, axios instance

Login fallback for dev only: admin@example.com / password returns a dummy token. Do not use in production.

### Credits

Built with Claude.
