require('dotenv').config();

// cockroachdb
// mongodb
// mysql
// postgresql
// sqlite
// sqlserver

const fs = require('fs');

main();
async function main() {
    let schema;
    if (process.env.SCHEMA_SOURCE)
        schema = await getSchemaFromSource(process.env.SCHEMA_SOURCE);
    else
        schema = fs.readFileSync(`./prisma/schema.prisma`).toString();

    const provider = process.env.PROVIDER;
    schema = schema.replaceAll('{provider}', provider);
    fs.writeFileSync(`./prisma/schema.prisma`, schema);
}

async function getSchemaFromSource(provided) {
    let origin = 'https://github.com';
    if (provided.startsWith('http')) {
        origin = new URL(provided).origin;
        provided = provided.slice(origin.length + 1);
    }

    if (origin === 'https://github.com')
        return await getSchemaFromGithub(provided);

    //todo
}

async function getSchemaFromGithub(provided) {
    let owner = provided.split('/')[0];
    let repo = provided.split('/')[1];
    let possibleBranches = [
        'main',
        'master',
    ];
    let possiblePaths = [
        'prisma/schema.prisma',
        'schema.prisma',
    ];

    if (provided.split('/').length === 2) {
        // owner/repo

    } else if (provided.split('/').length === 3) {
        // owner/repo/branch
        possibleBranches = [provided.split('/')[2]];

    } else if (provided.split('/').length === 4 && (provided.split('/')[2] === 'tree' || provided.split('/')[2] === 'blob')) {
        // owner/repo/tree/branch or owner/repo/blob/branch
        possibleBranches = [provided.split('/')[3]];

    } else if (provided.split('/')[2] === 'tree' || provided.split('/')[2] === 'blob') {
        // owner/repo/blob/branch/path or owner/repo/tree/branch/path
        possibleBranches = [provided.split('/')[3]];
        possiblePaths = provided.split('/').slice(4);

    } else
        throw new Error(`Don't know how to parse ${provided}`);

    console.log({ owner, repo, possibleBranches, possiblePaths });
    process.exit();
}