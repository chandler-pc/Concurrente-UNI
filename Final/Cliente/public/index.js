var nameC;
var ruc;

function validateForm(){
    var nameC = document.getElementById('name').value;
    var ruc = document.getElementById('ruc').value;
    if(nameC == ""){
        alert('Ingrese su nombre');
        nameC.focus();
        return false;
    }

    if(ruc == ""){
        alert('Ingrese su ruc');
        ruc.focus();
        return false;
    } else if(ruc.length < 11 && ruc.length > 0){
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
window.onload = function() {
    var urlParams = new URLSearchParams(window.location.search);
    var name = urlParams.get('name');
    var ruc = urlParams.get('ruc');
    console.log(name);
    console.log(ruc);
    var welcomeMessage = 'Bienvenido ' + name + ' identificado con RUC ' + ruc;

    var welcomeElement = document.getElementById('welcomeMessage');

    welcomeElement.textContent = welcomeMessage;
}
var productos = [
    { id: 1, nombre: "Producto 1", precio: 10, cantidad: 0 },
    { id: 2, nombre: "Producto 2", precio: 20, cantidad: 0 },
    { id: 3, nombre: "Producto 3", precio: 30, cantidad: 0 }
];


document.addEventListener("DOMContentLoaded", function () {
    // Cargar productos desde el archivo de texto o una fuente de datos
    // Obtener el elemento del cuerpo de la tabla
    var tbody = document.getElementById("tbody");

    // Generar filas de la tabla con productos
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

    // Función para sumar la cantidad de un producto
    window.sumarCantidad = function (id) {
        var cantidadElement = document.getElementById(`cantidad-${id}`);
        productos.find(producto => producto.id === id).cantidad++;
        cantidadElement.textContent = productos.find(producto => producto.id === id).cantidad;
    };

    // Función para restar la cantidad de un producto
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

function generarFactura() {
    var venta = obtenerDatosDeVenta();

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