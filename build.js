require('dotenv').config();

const possibleProviders = [
    'cockroachdb',
    'mongodb',
    'mysql',
    'postgresql',
    'sqlite',
    'sqlserver',
];

const fs = require('fs');

main();
async function main() {
    if (!process.env.DATABASE_URL)
        throw 'No DATABASE_URL specified, please specify one in the variables/env';

    let schema;
    if (process.env.SCHEMA_SOURCE)
        schema = await getFileFromExternalSource(process.env.SCHEMA_SOURCE);
    else {
        let provider;

        if (process.env.PROVIDER)
            provider = process.env.PROVIDER;
        else for (const possibleProvider of possibleProviders)
            if (process.env.DATABASE_URL.toLowerCase().includes(possibleProvider.toLowerCase())) {
                provider = possibleProvider;
                break;
            }

        schema = fs.readFileSync(`./prisma/schema.prisma`, 'utf8');

        if (!provider)
            throw 'No provider specified, please specify one in the variables/env';
    }

    const provider = process.env.PROVIDER;
    if (provider && !process.env.SCHEMA_SOURCE)

        fs.writeFileSync(`./prisma/schema.prisma`, schema, 'utf8');
}

async function getFileFromExternalSource(provided) {
    console.log(`Loading schema from external source ${provided}`);

    const possibleUris = getPossibleUrisFromExternalSource(provided);

    for (const uri of possibleUris) {
        console.log(`Trying to load from ${uri}`);
        try {
            // const response = await fetch(uri);
            const response = fetch(uri, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "priority": "u=0, i",
                    "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "cross-site",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1",
                    "Referer": "https://github.com/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            });

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