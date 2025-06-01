

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
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic and service implementations
│   ├── storage/         # Data access layer
│   ├── vite/            # Vite configuration for development
│   └── index.ts         # Entry point for the server
├── shared/              # Shared code between client and server
│   ├── schema/          # Data schemas
│   └── types/           # TypeScript type definitions
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

### Development:

1. Install dependencies:
   ```bash
   cd /workspace/LifeMasterAI
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at:
   - http://localhost:54903
   - http://localhost:59712

### Production:

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

The backend provides several API endpoints for different functionalities:

- **Authentication**: `/api/auth/register`, `/api/auth/login`
- **Family Members**: `/api/family-members`
- **Stores**: `/api/stores`
- **Dietary Preferences**: `/api/dietary-preferences`
- **Recipes**: `/api/recipes`, `/api/recipe-ratings`
- **Meal Plans**: `/api/meal-plans`
- **Deals**: `/api/deal-items`

## Deployment

The application is configured to serve both API and client from a single Express server on multiple ports (54903, 59712). For deployment, ensure that:

1. All necessary ports are open (ports 54903 and 59712)
2. CORS settings allow requests from your frontend domain

## Configuration

The project uses Vite for the frontend build and Express.js for the backend API. The configuration files are:

- `vite.config.ts`: Vite configuration with plugin settings
- `server/index.ts`: Main server file with route registration and middleware setup

### Server Configuration

The server is configured to run on multiple ports (54903 and 59712) as required by the runtime environment. The configuration allows iframes, CORS requests, and access from any host.

## Contributing

Please follow standard Git workflow practices when contributing to this project:
1. Create a new branch for each feature or bug fix
2. Write clear commit messages
3. Include appropriate tests for new features
4. Follow the existing code style and conventions

## License

This project is licensed under the MIT License.

