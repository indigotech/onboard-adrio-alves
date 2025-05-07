# Taqtile Intro Adrio

First project to kick off my journey at Taqtile. The goal is to help me get used to our technology stack, patterns, and best practices.

This project is a simple backend API that allows you to create, read, update, and delete (CRUD) user data in a PostgreSQL database.

## Environment and Tools

This project uses the following tools and technologies:

- **Node.js**: JavaScript runtime for building the backend.
- **TypeScript**: Superset of JavaScript for type safety and better developer experience.
- **Express.js**: Web framework for building the API.
- **Prisma**: ORM for database management and migrations.
- **PostgreSQL**: Relational database for storing user data.
- **Docker**: Used to run PostgreSQL in a containerized environment.
- **Biome**: Linter and formatter for maintaining code quality.
- **Nodemon**: Development tool for automatically restarting the server on file changes.

## Prerequisites

Before running the project, ensure you have the following installed:

- Node.js (v20 or higher)
- Docker (for running the database)
- npm (for managing dependencies)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd onboard-adrio-alves
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     DATABASE_URL=postgresql://<username>:<password>@localhost:5432/postgres_hello_world
     ```

4. Start the PostgreSQL database using Docker:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations and generate Prisma client:
   ```bash
   npm run db:codegen
   ```

## Run and Debug

### Running the Project

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. The API will be available at `http://localhost:3000`.

### Development Mode

To run the project in development mode with hot-reloading:
```bash
npm run dev
```

### Debugging

1. Use the `dev` script for live reloading during development.
2. Add breakpoints in your code using your IDE (e.g., Visual Studio Code).
3. Use Docker logs to debug database-related issues:
   ```bash
   docker logs localdb
   ```

## Testing the API

You can test the API endpoints using tools like:

- **Postman**: For sending HTTP requests.
- **curl**: Command-line tool for testing endpoints.
- **dbeaver**: For database management and testing SQL queries.

## Project Structure

```
onboard-adrio-alves/
├── src/                # Source code
│   └── index.ts        # Entry point of the application
├── prisma/             # Prisma schema and migrations
├── dist/               # Compiled JavaScript files
├── db/                 # Database-related files
├── package.json        # Project metadata and scripts
├── tsconfig.json       # TypeScript configuration
├── docker-compose.yml  # Docker configuration for PostgreSQL
└── README.md           # Project documentation
```
