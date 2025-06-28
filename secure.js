const http = require('http')
const httpProxy = require('http-proxy')
const auth = require('basic-auth')
require('dotenv').config();

const { SECURE_ENABLED, SECURE_USER, SECURE_PASS } = process.env

if (SECURE_ENABLED !== 'true') {
  console.log('Secure proxy is disabled (SECURE_ENABLED is not "true")')
  process.exit(0)
}

if (!SECURE_USER || !SECURE_PASS) {
  throw 'Missing SECURE_USER or SECURE_PASS. Please specify both in the environment variables.'
}

const proxy = httpProxy.createProxyServer({})

http.createServer((req, res) => {
  const user = auth(req)
  if (!user || user.name !== SECURE_USER || user.pass !== SECURE_PASS) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Secure Prisma Studio"' })
    res.end('Access denied')
    return
  }
  proxy.web(req, res, { target: 'http://localhost:3000' })
}).listen(3001, () => {
  console.log('🔐 Secure Prisma Studio available at http://localhost:3001')
})
