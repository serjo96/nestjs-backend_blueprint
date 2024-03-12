
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
- A PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/serjo96/nestjs-backend_blueprint.git
cd nestjs-backend_blueprint
```

2. Install dependencies:

```bash
npm install
```

3. Copy the `.env.development` and `.env.test` files and configure them according to your environment:

```bash
cp .env.development .env
```

### Running the Application

To run the application in development mode:

```bash
npm run start:dev
```

For a production-like environment with Docker:

```bash
docker-compose up --build
```

### Running Migrations

To apply database migrations:

```bash
npm run typeorm migration:run
```

### Accessing the API

Once the application is running, you can access the API at `http://localhost:3000`.

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
