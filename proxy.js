const http = require('http');
const httpProxy = require('http-proxy');
const auth = require('basic-auth');

require('dotenv').config();

let { SECURE_ENABLED, SECURE_USER, SECURE_PASS } = process.env;

SECURE_ENABLED = SECURE_ENABLED === true || SECURE_ENABLED === 'true';

if (SECURE_ENABLED && (!SECURE_USER || !SECURE_PASS))
    throw 'Missing SECURE_USER or SECURE_PASS. Please specify both in the environment variables.';

const proxy = httpProxy.createProxyServer({});

http.createServer((req, res) => {
    if (SECURE_ENABLED) {
        const user = auth(req);

        if (!user || user.name !== SECURE_USER || user.pass !== SECURE_PASS) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Secure Prisma Studio"' })
            res.end('Access denied');
            return
        }
    }

    proxy.web(req, res, { target: 'http://localhost:3000' });
}).listen(3001, () => {
    console.log('Proxied Prisma Studio available at http://localhost:3001');
});