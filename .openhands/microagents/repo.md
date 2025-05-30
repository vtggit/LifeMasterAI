

# LifeMasterAI Repository

## Overview
LifeMasterAI is a full-stack web application that helps users manage their meal planning, grocery shopping, and recipes. The application features AI-powered suggestions for meals based on user preferences and available deals from local grocery stores.

The project consists of both client-side (React) and server-side (Express.js) components, with a modular architecture that separates concerns between different parts of the application.

## Key Features

- **Meal Planning**: Create and manage meal plans for the week
- **Grocery Deals**: Find and track deals from local grocery stores
- **Recipes Management**: Store and organize favorite recipes
- **AI Suggestions**: Get AI-powered meal suggestions based on preferences
- **Shopping List**: Generate shopping lists based on meal plans

## Technology Stack

### Frontend:
- React with TypeScript
- Vite as the build tool
- Tailwind CSS for styling
- Radix UI components
- React Query for data fetching and caching
- Wouter for routing

### Backend:
- Express.js framework
- TypeScript
- Drizzle ORM for database interactions
- Passport for authentication
- WebSocket support (ws)

### Database:
- PostgreSQL (via Neondatabase serverless)
- Connect-pg-simple for session storage

## Project Structure

```
/workspace/LifeMasterAI
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility libraries
│   │   ├── pages/       # Different routes/pages of the app
│   │   ├── types/       # TypeScript type definitions
│   │   ├── App.tsx      # Main application component
│   │   └── main.tsx     # Entry point for React app
│   ├── index.html       # HTML template
│   └── ...              # Other frontend files
├── server/              # Express backend application
│   ├── services/        # Business logic and service implementations
│   └── index.ts         # Entry point for the server
├── shared/              # Shared code between client and server
├── .gitignore           # Git ignore file
├── package.json         # NPM package configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
└── ...                  # Other project files
```

## How to Run the Application

### Prerequisites:
- Node.js (v18 or later)
- npm or yarn
- PostgreSQL database (or use Neondatabase serverless)

### Development:

1. Install dependencies:
   ```bash
   cd /workspace/LifeMasterAI
   npm install
   ```

2. Set up environment variables by creating a `.env` file based on `.env.example`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at http://localhost:5000

### Production:

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Deployment

The application is configured to serve both API and client from a single Express server on port 5000. For deployment, ensure that:

1. The database connection string is properly configured in your environment variables
2. All necessary ports are open (port 5000 is the primary port used)
3. CORS settings allow requests from your frontend domain

## Contributing

Please follow standard Git workflow practices when contributing to this project:
1. Create a new branch for each feature or bug fix
2. Write clear commit messages
3. Include appropriate tests for new features
4. Follow the existing code style and conventions

## License

This project is licensed under the MIT License.

