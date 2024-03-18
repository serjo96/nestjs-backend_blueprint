# NestJS Backend Blueprint

This project serves as a comprehensive template for building scalable and maintainable backend services using NestJS. It incorporates best practices and provides a solid foundation for developing robust applications.

## Features

- **Modular Architecture**: Organized around feature modules to keep the codebase clean and scalable.
- **Authentication and Authorization**: Built-in support for user authentication and role-based authorization.
- **Email Service**: Integrated email service for user verification, password reset, and other notifications.
- **Database Migrations**: TypeORM migrations for easy database schema management.
- **Docker Support**: Containerization support with Docker for development and production environments.
- **Continuous Integration and Deployment**: Pre-configured GitHub Actions workflows for CI/CD.
- **Comprehensive Testing**: Unit and e2e testing setup with Jest.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose (for containerized environments)
- (Optional) Remove from .gitignore /migrations folder, if you want to share your migrations at git.
- (Optional) Add .env.production for some prod env or just add required env, at your environment.

### Installation

1. Install dependencies:

```bash
yarn install
```

2. Copy the `.env.development` and `.env.test` files and configure them according to your environment:

```bash
cp .env.development .env
```

### Running the Application

For run additional services like PostgreSQL and email service for local development, run docker-compose:

```bash
docker-compose up --build
```

To run the application in development mode:

```bash
npm run start:dev
```

### Working with Migrations

Generating init migrations:

```bash
yarn run typeorm migration:generate -d src/ormconfig.ts migrations/MIGRATION_NAME
```

To apply database migrations:

```bash
yarn run typeorm migration:run
```

*All scripts for migrations also have in package.json*

### Accessing the API

Once the application is running, you can access the API at http://localhost:3000.

### Accessing the OpenAPI docs

After starting the application, API docs will be available at http://localhost:3000/api/

### Additional Services

- **pgAdmin**: Access pgAdmin for database management at [http://localhost:5050/browser/](http://localhost:5050/browser/). Default authentication data:
    - **Login**: admin@example.com
    - **Password**: qwerty123

- **MailHog**: Access MailHog for local email testing at [http://localhost:8025/](http://localhost:8025/).

All credentials for local development can be viewed and modified in the `.env.development` file.

## Testing

### Unit Tests

To run unit tests:

```bash
npm run test
```

### End-to-End Tests

To run e2e tests:

```bash
npm run test:e2e
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
