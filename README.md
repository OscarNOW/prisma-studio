# Prisma studio
This is a Railway template used to quickly host prisma studio given only a database url (and provider and/or schema).

It is made to be quick to set up and to have minimal configuration required. **BE CAREFUL**, because anyone that has access to prisma studio can make changes to the database.

## Options
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
