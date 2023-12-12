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
        alert('Ingrese un ruc válido');
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
    var welcomeMessage = 'Bienvenido ' + name + ' con RUC ' + ruc;

    var welcomeElement = document.getElementById('welcomeMessage');

    welcomeElement.textContent = welcomeMessage;
}


document.addEventListener("DOMContentLoaded", function () {
    // Cargar productos desde el archivo de texto o una fuente de datos
    var productos = [
        { id: 1, nombre: "Producto 1", precio: 10, cantidad: 0 },
        { id: 2, nombre: "Producto 2", precio: 20, cantidad: 0 },
        { id: 3, nombre: "Producto 3", precio: 30, cantidad: 0 }
    ];

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