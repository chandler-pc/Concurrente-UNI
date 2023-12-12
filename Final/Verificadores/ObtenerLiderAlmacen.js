const http = require('http');

let puerto_lider = 0;

let nodos = [
    {
        id: 1,
        nombre: 'nodo1',
        ip: 'localhost:9091',
        estado: 'inactivo'
    },
    {
        id: 2,
        nombre: 'nodo2',
        ip: 'localhost:9092',
        estado: 'inactivo'
    },
    {
        id: 3,
        nombre: 'nodo3',
        ip: 'localhost:9093',
        estado: 'inactivo'
    }
];

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (req.url === '/') {
        res.end(JSON.stringify({ puerto_lider }));
    } else {
        res.end('ok');
    }
});

const checkNodes = () => {
    const promises = nodos.map(async (nodo) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: nodo.ip.split(':')[0],
                port: nodo.ip.split(':')[1],
                path: '/',
                method: 'HEAD'
            };
            const req = http.request(options, res => {
                nodo.estado = 'activo';
                console.log(`Nodo ${nodo.nombre} activo`);
                resolve();
            });
            req.on('error', error => {
                nodo.estado = 'inactivo';
                console.log(`Nodo ${nodo.nombre} inactivo`);
                resolve();
            });
            req.end();
        });
    });
    return Promise.all(promises);
}
const check = async () =>{
    await Promise.all([checkNodes()]);
    for(let i = 0; i < nodos.length; i++){
        const nodo = nodos[i];
        if(nodo.estado === 'activo'){
            fetch(`http://${nodo.ip}/status`, {
                method: 'PUT',
                body: 'lider'
            });
            puerto_lider =  nodo.ip.split(':')[1];
            break;
        }
    }
}
server.listen(9090, async () => {
    check();
    console.log('Verificador de nodos activo');
    console.log('Server listening on port 9090');
});
