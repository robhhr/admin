### admin

personal content management for [my site](https://github.com/robhhr/robhhr)

#### tech

- Postgres
- Redis
- React Router
- Tailwind

#### prerequisites

- node.js version (from .nvmrc)
- PostgreSQL
- Valkey/Redis
- env variables needed

#### installation & setup

##### install dependencies

```
pnpm install
```

##### set up env variables

```
DATABASE_URL, REDIS_URL, SESSION_SECRET, etc.
```

##### init db & run schema files found in `/db`

##### init server

```
pnpm run dev
```
