<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

A comprehensive NestJS application featuring a standardized Product API with advanced caching, HATEOAS implementation, and robust error handling. This project demonstrates best practices for building scalable and maintainable REST APIs with both REST and GraphQL interfaces.

## Features

- **Standardized API Responses**: Consistent response structures across all endpoints
- **HATEOAS Implementation**: Hypermedia links for API discoverability and navigation
- **Advanced Caching**: ETag-based caching with conditional requests (304 Not Modified)
- **Comprehensive Error Handling**: Detailed error responses with trace IDs and helpful hints
- **Dual API Support**: Both REST and GraphQL interfaces sharing the same business logic
- **Advanced Query Features**: Filtering, sorting, pagination, and field selection
- **Robust Validation**: Comprehensive input validation with detailed error messages
- **Performance Monitoring**: Request tracing and structured logging
- **Interactive Documentation**: Swagger/OpenAPI documentation with examples

## API Documentation

- **Interactive API Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) (when running locally)
- **Migration Guide**: [docs/api-migration-guide.md](docs/api-migration-guide.md)
- **Development Guidelines**: [REST.md](REST.md)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Project setup

```bash
$ npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
PORT=3000
NODE_ENV=development
```

### Database Setup

```bash
# Generate Prisma client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate dev

# (Optional) Seed the database
$ npx prisma db seed
```

## Running the Application

```bash
# development
$ npm run start

# watch mode (recommended for development)
$ npm run start:dev

# production mode
$ npm run start:prod
```

Once running, you can access:

- **REST API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **GraphQL Playground**: [http://localhost:3000/graphql](http://localhost:3000/graphql)
- **API Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## API Usage Examples

### REST API

```bash
# Get all products with pagination
curl "http://localhost:3000/api/v1/products?page=1&limit=10"

# Create a new product
curl -X POST "http://localhost:3000/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16\"",
    "description": "High-performance laptop",
    "price": 2499.99,
    "category": "electronics"
  }'

# Get product with ETag caching
curl -H "If-None-Match: \"abc123\"" "http://localhost:3000/api/v1/products/1"

# Filter products by category and price range
curl "http://localhost:3000/api/v1/products?category=electronics&minPrice=1000&maxPrice=3000"

# Search products
curl "http://localhost:3000/api/v1/products?search=laptop"

# Get specific fields only
curl "http://localhost:3000/api/v1/products?fields=id,name,price"
```

### GraphQL

```graphql
# Query products
query GetProducts {
  products {
    id
    name
    price
    category
  }
}

# Create a product
mutation CreateProduct {
  createProduct(input: {
    name: "MacBook Pro 16\""
    description: "High-performance laptop"
    price: 2499.99
    category: "electronics"
  }) {
    id
    name
    price
  }
}

# Subscribe to product updates
subscription ProductUpdates {
  productUpdated {
    id
    name
    price
  }
}
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
