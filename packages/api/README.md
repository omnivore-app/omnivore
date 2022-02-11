# Backend

This workspace is dedicated to API server that uses Apollo GraphQL server and Knex query builder to provide the app with data operations.

## GraphQL schema

GraphQL schema is located in `schema.ts`. In order to use new types, queries or mutations you need to declare them there and then run `yarn gql-typegen` from the application root to create the necessary typings in order to write GQL queries from the app.

## Apollo resolvers and data sources

We make use of Apollo resolvers and data sources. Resolvers typically contain business logic and handling of user domain errors, while data sources are ideally simple atomic database operations.

## Interacting with the database

All operations on the database must be wrapped in Knex transaction on a resolver layer. This ensures data integrity and safety with no side effects on a failed operations.

Because we make use of Row Level Security in the database, - all operations typically begin with assuming the role for which policies exist via `omnivore.set_claims` database function.

## Image Proxy (optional for local dev)

Backend API server returns article image links using image proxy
(/imageproxy). You will need to set the env with var IMAGE_PROXY_URL to point
to a running instance of image proxy along with env var IMAGE_PROXY_SECRET. The
same secret env var ought to be passed as config to the running image proxy
service. You can also use the docker-compose-dev.yml file to bring up just the
image proxy service alone (w/ env var for secret specified in the compose file)
by running: ```docker-compose -f docker-compose-dev.yml up -d imageproxy```.

When running locally, use the .env.local file to set up the env variables in your environment.


### Set up the database
Refer the [using locally](../db/README.md#using-locally) section from db README.

### Copy .env.example file to .env file:
    cp .env.example .env

### Run the app
    yarn dev
