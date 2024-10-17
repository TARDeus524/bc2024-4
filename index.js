const { program } = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');

program
    .option('-h, --host <ip>', 'ip address of the server')
    .option('-p, --port <port>', 'port of the server')
    .option('-c, --cache <path>', 'path to cache files');

program.parse(process.argv);

const opts = program.opts();

if (!opts.host) throw new Error('no ip');
if (!opts.port) throw new Error('no port');
if (!opts.cache) throw new Error('no cache path');

const cachePath = opts.cache;

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        getCache(req.url, cachePath).then((value) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/jpeg');
            res.end(value); 
        }).catch((err) => {
            superagent.get(`https://http.cat${req.url}`)
                .buffer(true)
                .then((response) => {
                    fs.promises.writeFile(path.join(cachePath, `${req.url.substring(1)}.jpeg`), response.body)
                        .then(() => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'image/jpeg');
                            res.end(response.body);
                        })
                        .catch((writeErr) => {
                            console.error('Error saving the image to cache:', writeErr);
                            res.statusCode = 500;
                            res.end('Error saving the image to cache');
                        });
                })
                .catch((error) => {
                    console.error('Error fetching from external API:', error);
                    res.statusCode = 404;
                    res.end('Image not found');
                });
        });
    } else if (req.method === 'POST') {
        saveImage(req, cachePath).then(() => {
            res.statusCode = 201;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Image saved successfully');
        }).catch((err) => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end(err.message);
        });
    } else if (req.method === 'DELETE') {
        deleteCache(req, cachePath).then(() => {
            res.statusCode = 200;
            res.end('Image deleted successfully');
        }).catch((err) => {
            res.statusCode = 500;
            res.end(err.message);
        });
    } else {
        res.statusCode = 405;
        res.end('Method not allowed');
    }
});

server.listen(opts.port, opts.host, () => {
    console.log(`Server running at http://${opts.host}:${opts.port}`);
});

function getCache(URL, cacheDir) {
    const code = URL.substring(1);
    const filePath = path.join(cacheDir, `${code}.jpeg`);
    return fs.promises.readFile(filePath); 
}

function saveImage(req, cacheDir) {
    const code = req.url.substring(1);
    const filePath = path.join(cacheDir, `${code}.jpeg`);
    
    fs.promises.writeFile(filePath, req.end);
}

function deleteCache(req, cacheDir) {
    const code = req.url.substring(1);
    const filePath = path.join(cacheDir, `${code}.jpeg`);
    return fs.promises.unlink(filePath);
}