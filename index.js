const {program} = require('commander');
const http = require('http');
const fs = require('fs');
const path = require('path');

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
    if(req.method == 'GET'){
        let body;
        
        body = getCache(new URL(req.url), opts.cache);

        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(e.message);

        
        body.then((value) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/jpeg');
            res.end = value;
        },(err) => {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end(e.message);
        });
    }
    else if(req.method == 'POST'){
        
        let promise = saveImage(req, opts.cache);
        
        promise.then(()=>{
            res.statusCode = 201;
            res.setHeader('Content-Type', 'text/plain');
        }, (err)=>{
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end(err.message);
        })

    } 
    else if (req.method == 'DELETE'){

        deleteCache(req, opts.cache).then(()=>{
            res.statusCode = 200;
        })
    }
    else{
        res.statusCode = 405;
    }
})

server.listen(opts.port, opts.host, () => {
    console.log(`Server running at http://${opts.host}:${opts.port}`);
})

function getCache(URL, pathA){
    let code = URL.pathname;
    code = code.substring(1);
    
    return fs.promises.readFile(path.parse(`${pathA}/${code}.jpeg`));
}

function saveImage(req, pathA){
    return fs.promises.writeFile(`${path(pathA)}/${URL(req.url).path.substring(2)}.jpeg`, req.end);
}

function deleteCache(req, pathA){
    return fs.promises.unlink(`${path(pathA)}/${URL(req.url).path.substring(2)}.jpeg`);
}