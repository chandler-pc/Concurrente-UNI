const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomInt } = require('crypto');

const port = 8083;

const otherNodes = [
    "localhost:8081",
    "localhost:8082",
    "localhost:8083"
]

let raft = {
    status : 'follower',
    time : 0
}

function getFileContent(filename, res) {
    let filePath = path.join(__dirname, 'public', filename);
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404 - Archivo no encontrado');
            } else {
                res.writeHead(500);
                res.end(`Error del servidor: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEADER');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.url === '/') {
        if (req.method === 'GET') {   
            getFileContent('index.html', res);
            return;
        }
        if(req.method === 'HEAD'){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('ok');
            return;
        }
        return;
    }
    if(req.url === '/status'){
        if(req.method === 'GET'){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(raft.status);
            return;
        }
        if(req.method === 'PUT'){
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                raft.status = body;
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('ok');
            });
            return;
        }
    }
    if(req.url === '/timeout'){
        raft.timeout = randomInt(15, 30);
        setTimeout(() => {
            if(raft.status === 'lider'){
                console.log('Soy lider');
                for(let i = 0; i < otherNodes.length; i++){
                    const options = {
                        hostname: otherNodes[i].split(':')[0],
                        port: otherNodes[i].split(':')[1],
                        path: '/status',
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'text/plain'
                        }
                    };
                    const req = http.request(options, res => {
                        console.log(`Nodo ${otherNodes[i]} actualizado`);
                    });
                    req.on('error', error => {
                        console.log(`Nodo ${otherNodes[i]} no actualizado`);
                    });
                    req.write('follower');
                    req.end();
                }
                return;
            }
            if(raft.status === 'follower'){
                console.log('Soy follower');
            }
        }, raft.timeout);
    }
    if (req.url.startsWith('/public')) {
        const filename = req.url.split('/')[2];
        getFileContent(filename, res);
        return;
    }
    if (req.url.startsWith('/almacen')) {
        const params = req.url.split('/');
        const id = params[2];
        if (!isNaN(id)) {
            if (req.method === 'GET') {
                fs.readFile('almacen.txt', 'utf8', (err, data) => {
                    if (err) {
                      res.writeHead(500, { 'Content-Type': 'text/plain' });
                      res.end('Error al leer el archivo');
                      return;
                    }
                    const lines = data.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].split(',');
                        if (line[0] === id) {
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end(line.join(','));
                            return;
                        }
                    }
                });
            }
            if (req.method === 'PUT') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
                    fs.readFile('almacen.txt', 'utf8', (err, data) => {
                        if (err) {
                          res.writeHead(500, { 'Content-Type': 'text/plain' });
                          res.end('Error al leer el archivo');
                          return;
                        }
                        const lines = data.split('\n');
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i].split(',');
                            if (line[0] === id) {
                                lines[i] = `${id},${body}`;
                                break;
                            }
                        }
                        const updatedData = lines.join('\n');
                        fs.writeFile('almacen.txt', updatedData, 'utf8', (err) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Error al actualizar el archivo');
                                return;
                            }
                  
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end(`Producto con id ${id} actualizado`);
                        });
                    });
                });
            }
            if (req.method === 'DELETE') {
                fs.readFile('almacen.txt', 'utf8', (err, data) => {
                    if (err) {
                      res.writeHead(500, { 'Content-Type': 'text/plain' });
                      res.end('Error al leer el archivo');
                      return;
                    }
                    const lines = data.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].split(',');
                        if (line[0] === id) {
                            lines.splice(i, 1);
                            break;
                        }
                    }
                    const updatedData = lines.join('\n');
                    fs.writeFile('almacen.txt', updatedData, 'utf8', (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Error al actualizar el archivo');
                            return;
                        }
              
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end(`Producto con id ${id} eliminado`);
                    });
                });
            }
            return;
        }
        if (req.method === 'GET') {
            fs.readFile('./almacen.txt', (err, data) => {
                if (err) throw err  
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(data);
            });
            return;
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                fs.readFile('almacen.txt', 'utf8', (err, data) => {
                    if (err) {
                      res.writeHead(500, { 'Content-Type': 'text/plain' });
                      res.end('Error al leer el archivo');
                      return;
                    }
                    const lines = data.split('\n');
                    const id = parseInt(lines[lines.length - 1].split(',')[0])+1;
                    const product = body.split(',');
                    fs.appendFile('almacen.txt', `\n${id},${product.join(',')}`, (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Error al guardar el producto');
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Producto guardado');
                    });
                });
            });
        }
    }
});

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`http://localhost:${port}`);
});