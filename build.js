require('dotenv').config();

const possibleProviders = [
    'cockroachdb',
    'mongodb',
    'mysql',
    'postgresql',
    'sqlite',
    'sqlserver',
];

const providerAliases = {
    postgres: 'postgresql',
    cockroach: 'cockroachdb',
    mongo: 'mongodb',
    lite: 'sqlite',
    mssql: 'sqlserver',
    serversql: 'sqlserver',
    my: 'mysql',
};

const fs = require('fs');

main();
async function main() {
    if (!process.env.DATABASE_URL)
        throw 'No DATABASE_URL specified, please specify one in the variables/env';

    let schema;
    if (process.env.SCHEMA_SOURCE)
        schema = await getFileFromExternalSource(process.env.SCHEMA_SOURCE);
    else {
        schema = fs.readFileSync(`./prisma/schema.prisma`, 'utf8');

        let provider = process.env.PROVIDER;

        if (!provider)
            for (const possibleProvider of possibleProviders)
                if (process.env.DATABASE_URL.toLowerCase().includes(possibleProvider.toLowerCase())) {
                    provider = possibleProvider;
                    break;
                }

        if (!provider)
            for (const [alias, aliasProvider] of Object.entries(providerAliases))
                if (process.env.DATABASE_URL.toLowerCase().includes(alias.toLowerCase())) {
                    provider = aliasProvider;
                    break;
                }

        if (!provider)
            throw 'No provider specified, please specify one in the variables/env';

        console.log(`Using provider ${provider}`);
        schema = schema.replaceAll('{provider}', provider);
    }

    fs.writeFileSync(`./prisma/schema.prisma`, schema, 'utf8');
}

async function getFileFromExternalSource(provided) {
    console.log(`Loading schema from external source ${provided}`);

    const possibleUris = getPossibleUrisFromExternalSource(provided);

    for (const uri of possibleUris) {
        console.log(`Trying to load from ${uri}`);
        try {
            const response = await fetch(uri);
            if (!`${response.status}`.startsWith('2')) {
                console.log(`Status code is ${response.status}`);
                continue;
            }

            const file = await response.text();
            return file;
        } catch (e) {
            console.log(e);
        }
    }

    throw `Could not load schema from ${provided}`;
}

function getPossibleUrisFromExternalSource(provided) {
    let origin = 'https://github.com';
    if (provided.startsWith('http')) {
        origin = new URL(provided).origin;
        provided = provided.slice(origin.length + 1);
    }

    console.log(`Parsed origin as ${origin}`);

    if (origin === 'https://github.com')
        return getPossibleUrisFromGithubSource(provided);

    console.log('Parsed source as full uri to the file');

    return [`${origin}/${provided}`];
}

function getPossibleUrisFromGithubSource(provided) {
    console.log(`Loading schema from github ${provided}`);

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
        console.log('Source is in form owner/repo');

    } else if (provided.split('/').length === 3) {
        // owner/repo/branch
        console.log('Source is in form owner/repo/branch');
        possibleBranches = [provided.split('/')[2]];

    } else if (provided.split('/').length === 4 && (provided.split('/')[2] === 'tree' || provided.split('/')[2] === 'blob')) {
        // owner/repo/tree/branch or owner/repo/blob/branch
        console.log('Source is in form owner/repo/tree/branch or owner/repo/blob/branch');
        possibleBranches = [provided.split('/')[3]];

    } else if (provided.split('/')[2] === 'tree' || provided.split('/')[2] === 'blob') {
        // owner/repo/blob/branch/path or owner/repo/tree/branch/path
        console.log('Source is in form owner/repo/blob/branch/path or owner/repo/tree/branch/path');
        possibleBranches = [provided.split('/')[3]];
        possiblePaths = [provided.split('/').slice(4).join('/')];

    } else
        throw `Don't know how to parse github source ${provided}`;

    console.log('Parsed as', { owner, repo, possibleBranches, possiblePaths });

    let possibleUris = [];

    for (const path of possiblePaths)
        for (const branch of possibleBranches)
            possibleUris.push(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`)

    return possibleUris;
}