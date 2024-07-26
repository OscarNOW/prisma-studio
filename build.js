require('dotenv').config();

// cockroachdb
// mongodb
// mysql
// postgresql
// sqlite
// sqlserver

const fs = require('fs');
const provider = process.env.PROVIDER;

let schema = fs.readFileSync(`./prisma/schema.prisma`);
schema = schema.replaceAll('{provider}', provider);
fs.writeFileSync(`./prisma/schema.prisma`, schema);
