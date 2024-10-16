const {program} = require('commander');
const http = require('http');

program
    .option('-h, --host <ip>', 'ip adress of the server')
    .option('-p, --port <port>', 'port of the server')
    .option('-c, --cache <path>', 'path to cache files');

program.parse(process.argv);

const opts = program.opts();

if (!opts.host) throw new Error('no ip');
if (!opts.port) throw new Error('no port');
if (!opts.cache) throw new Error('no cache path');

const cachePath = opts.cache;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
})

server.listen(opts.port, opts.host, () => {
    console.log(`Server running at http://${opts.host}:${opts.port}`);
})