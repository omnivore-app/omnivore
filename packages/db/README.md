# Database management

This workspace is used for database schema definitions and migrations.

Project currently uses PostgreSQL 11. Make sure you use the correct version.

## Migrations usage

:exclamation: It is important to understand that migrations that had already been performed are _locked_ and are not a subject to change. Therefore for every alteration of schema you need to generate a new migration and perform alterations there.

Never commit changed files for migrations that already had been performed elsewhere, - it will break the migrations. 

To migrate to latest version: `yarn migrate`

To migrate up/down to specific version: `yarn migrate <version>`

To migrate down to empty state: `yarn migrate 0000`

To generate new migration: `yarn generate`

_* At the moment, version numbers expect to be padded to 4 digits_


## Policies and roles

We use Row Level Security when accessing the database from the application. In order to create a correct schema for new tables please study migration files for the schemas of previous tables (including possible later changes).

In order to use Row Level Security every transaction with the database must set the correct role via `omnivore.set_claims` function.

### Current roles

`omnivore_user` - a user role that is intended for a regular user to access the data. Currently, this is the primary user of the database. 

## Database users on GCP

`postgres` - administrator of the database, used for migrations.

`app_user` - a user that the app uses to login to database.
   
:exclamation: Do not issue any extra grants to `app_user` other than that are needed to assume a certain internal role, i.e. `GRANT omnivore_user TO app_user`

## Installing and Using locally

- Install and run the _postgresql_ service on your machine.

###Configure access to the database

_On some systems, Postgres will only allow the local postgres user to connect to the database. One way around this is to
set the authentication method in your pg_hba.conf file_. The `trust` method allows any user who can connect to
database to make changes. The default is `peer` which means the user must be logged into the system as the `postgres`
user. Another option is `md5` or `password` which allows access to the postgres user with a password instead of
needing to be logged in locally as `postgres`. For simplicity, set the method to `trust`. **You
  will need to restart the postgresql service after making this change.**

- Verify you can connect to postgres `psql -U postgres`.

- Quit psql (command is `\q`)

- Create database using handy CLI tool (which needs the `-U <user>` flag for now):
  ```bash
  $ createdb -U postgres omnivore
  ```
- Copy .env.example file to .env file: `cp .env.example .env`
- Modify `.env` and set `PG_USER` to `postgres`

- Run migration: `yarn migrate`

## Accessing the database locally

Instead of using the superuser to access, create a user with the `omnivore_user` role. You can choose your local
username instead of `app_user` here to avoid needing the `-U app_user` flag in the `psql` command below.

- Create a user named `app_user` in Postgres
- Allow `app_user` to assume the roles necessary for the application. **Do not manually grant any other role to
`app_user`**

`$ psql -U postgres`
```sql
# CREATE USER app_user WITH ENCRYPTED PASSWORD 'app_pass';
# GRANT omnivore_user to app_user;
```

- Update the `PG_USER` and `PG_PASSWORD` values in `.env` files (packages/db, pkg/api) to `app_user` and `app_pass`,
respectively

- You can now use psql to login to your database: `psql -U app_user -d omnivore`

## Gotchas
Postgres Row-Level Security can at times catch us off guard: there are policies limiting select/update operations on
tables based on active user role/ID in a transaction block. So at times, when working on the local database, one must
make sure to login via `postgres` user to view all rows in the tables or perform updates.
