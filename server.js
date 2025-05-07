require('dotenv').config();

const fs = require('fs');
const https = require('https');
const next = require('next');
const { parse } = require('url');


const dev = false;
const hostname = process.env.HOST;         //Host LAN IP
const port = process.env.PORT;
const certkey = process.env.KEY;
const certpem = process.env.PEM;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const sslOptions = {
  key:  fs.readFileSync(certkey),
  cert: fs.readFileSync(certpem),
};

app.prepare().then(() => {
  https.createServer(sslOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, err => {
    if (err) throw err;
    console.log(`> Server running at https://${hostname}:${port}`);
  });
});