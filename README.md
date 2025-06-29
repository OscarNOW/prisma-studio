# Deploy and Host Prisma Studio on Railway

This is a Railway template used to quickly host Prisma Studio with only a database url. It is made to be quick to set up and have minimal configuration required.

Prisma Studio is a database viewer using Prisma where you can easily view data and relations in a database.
![Prisma Studio screenshot](https://github.com/user-attachments/assets/da2ef03a-1c0e-43da-95ac-189ef6614ea8)

## About Hosting Prisma Studio
### Auth
Prisma Studio sits behind a basic auth proxy. You can find the `SECURE_USER` and `SECURE_PASS` (username and password) inside the Railway service variables.

### Database url
Required, This is the database url prisma uses to connect to the database.

### Provider
Optional, This is the database provider prisma uses. Possible values: 
* cockroachdb
* mongodb
* mysql
* postgresql
* sqlite
* sqlserver

If unset, the provider will be guessed from the database url.

### Schema source
If set, the schema will be loaded from this source instead of from the database.

While this template still works without a prisma schema, it's a better experience to have one, as things like relations that are only stored in the schema and not in the database, will not show up in prisma studio without a prisma schema.

This is either a direct link to the text contents of the schema, or a public github repo containing the schema.
Supported formats:
* Direct link to the text contents of the schema, starting with `http` where the origin is not `https://github.com`.
* owner/repo
* owner/repo/branch
* owner/repo/tree/branch
* owner/repo/blob/branch
* owner/repo/blob/branch/path...
* owner/repo/tree/branch/path...

Examples of valid schema sources would be:
* https://github.com/prisma/prisma-examples/blob/latest/accelerate/svelte-starter/prisma/schema.prisma
* https://raw.githubusercontent.com/prisma/prisma-examples/latest/accelerate/svelte-starter/prisma/schema.prisma
* trpc/examples-next-prisma-starter
* trpc/examples-next-prisma-starter/main
* https://github.com/trpc/examples-next-prisma-starter

## Common Use Cases

- Debug problems your database
- Quickly view your data
- Bulk edit and delete data

## Dependencies for Prisma Studio Hosting

All dependencies are included in this template.

### Deployment Dependencies

[https://www.prisma.io/studio](https://www.prisma.io/studio)

## Why Deploy Prisma Studio on Railway?

Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying Prisma Studio on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.