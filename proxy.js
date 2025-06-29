const port = 3001;

const http = require('http');
const httpProxy = require('http-proxy');
const auth = require('basic-auth');

require('dotenv').config();

let { SECURE_ENABLED, SECURE_USER, SECURE_PASS } = process.env;

SECURE_ENABLED = SECURE_ENABLED === true || SECURE_ENABLED === 'true';

if (SECURE_ENABLED && (!SECURE_USER || !SECURE_PASS))
    throw 'Missing SECURE_USER or SECURE_PASS. Please specify both in the environment variables.';

if (!SECURE_ENABLED)
    console.warn('Secure not enabled, the database is open to anyone that can access the url');

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
}).listen(port, () => {
    // to ensure this log is at bottom
    setTimeout(log, 1000 * 2);
    setTimeout(log, 1000 * 30);
});

function log() {
    console.log('');
    console.log(`Proxied Prisma Studio available at port ${port}`);
    if (SECURE_ENABLED) {
        console.log(`Username: ${SECURE_USER}`);
        console.log(`Password: ${SECURE_PASS}`);
    }
    console.log('');
}