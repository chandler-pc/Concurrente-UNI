var nameC;
var ruc;

function validateForm() {
    var nameC = document.getElementById('name').value;
    var ruc = document.getElementById('ruc').value;
    if (nameC == "") {
        alert('Ingrese su nombre');
        nameC.focus();
        return false;
    }

    if (ruc == "") {
        alert('Ingrese su ruc');
        ruc.focus();
        return false;
    } else if (ruc.length < 11 && ruc.length > 0) {
        alert('Ingrese un ruc válido de 11 dígitos');
        ruc.focus();
        return false;
    }

    return { nameC, ruc };

}


function login() {
    var userDetails = validateForm();
    if (userDetails) {
        window.location.href = 'cart.html?name=' + userDetails.nameC + '&ruc=' + userDetails.ruc;
    }
}
window.onload = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var name = urlParams.get('name');
    var ruc = urlParams.get('ruc');
    var welcomeMessage = 'Bienvenido ' + name + ' identificado con RUC ' + ruc;

    var welcomeElement = document.getElementById('welcomeMessage');

    welcomeElement.textContent = welcomeMessage;
}

let productos = [];

document.addEventListener("DOMContentLoaded", async function () {
    const port = await fetch('http://localhost:9090/').then(response => response.json()).then(data => data.puerto_lider);
    productos = await fetch(`http://localhost:${port}/almacen`, {
        method: 'GET',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('La solicitud no fue exitosa');
            }
        })
        .then(data => {
            let productosArray = data.split('\n').map(producto => {
                const l = producto.split(',');
                precio = parseInt(l[4]);
                id = parseInt(l[0]);
                nombre = l[1];
                cantidad = 0;
                return { id, nombre, precio, cantidad };
            });
            return productosArray;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    var tbody = document.getElementById("tbody");

    productos.forEach(function (producto) {
        var row = document.createElement("tr");
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.precio}</td>
            <td class="d-flex align-items-center justify-content-center flex-row flex-wrap">
                <button id="min" class="me-5" onclick="restarCantidad(${producto.id})">-</button>
                <span class="me-5" id="cantidad-${producto.id}">${producto.cantidad}</span>
                <button id="mas" onclick="sumarCantidad(${producto.id})">+</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    window.sumarCantidad = function (id) {
        var cantidadElement = document.getElementById(`cantidad-${id}`);
        productos.find(producto => producto.id === id).cantidad++;
        cantidadElement.textContent = productos.find(producto => producto.id === id).cantidad;
    };

    window.restarCantidad = function (id) {
        var cantidadElement = document.getElementById(`cantidad-${id}`);
        var producto = productos.find(producto => producto.id === id);
        if (producto.cantidad > 0) {
            producto.cantidad--;
            cantidadElement.textContent = producto.cantidad;
        }
    };
});

window.cleanCart = function () {

    window.cleanCart = function () {
        productos.forEach(function (producto) {
            var cantidadElement = document.getElementById(`cantidad-${producto.id}`);
            if (cantidadElement) {
                cantidadElement.textContent = 0;
                producto.cantidad = 0;
            }
        });
    };
};

function obtenerDatosDeVenta() {
    var urlParams = new URLSearchParams(window.location.search);
    var nameC = urlParams.get('name');
    var ruc = urlParams.get('ruc');
    var productosSeleccionados = productos.filter(producto => producto.cantidad > 0);

    return {
        nameC: nameC,
        ruc: ruc,
        productos: productosSeleccionados
    };
}

async function generarFactura() {
    var venta = obtenerDatosDeVenta();
    const port = await fetch('http://localhost:9090/').then(response => response.json()).then(data => data.puerto_lider);
    const prods = venta.productos.map(producto => {
        return {
            id: producto.id,
            cantidad: producto.cantidad
        }
    });
    for(let i = 0; i < prods.length; i++){
        const res = await fetch(`http://localhost:${port}/almacen/${prods[i].id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            },
            body: -prods[i].cantidad
        });
        if(res.status !== 200){
            alert('No hay suficiente stock');
            return;
        }
    }
    fetch('http://localhost:8080/ventas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(venta)
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });
}