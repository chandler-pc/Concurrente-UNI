from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import sys
import json
from urllib.parse import urlparse, parse_qs

def leer_ventas():
    try:
        with open(os.path.join(os.path.dirname(__file__), 'ventas.txt'), 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return {}
    except FileNotFoundError:
        return {}

def escribir_ventas(ventas):
    with open(os.path.join(os.path.dirname(__file__), 'ventas.txt'), 'w') as f:
        json.dump(ventas, f)

def get_file_content(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read(), 200
    except FileNotFoundError:
        return "Archivo no encontrado", 404
    


class Servidor(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        if self.path == "/":
            content, status = get_file_content(os.path.join(os.path.dirname(__file__), f'public\\index.html'))
            self.send_response(status)
            self.end_headers()
            self.wfile.write(bytes(content, 'utf-8'))
        if self.path.startswith("/public"):
            content, status = get_file_content(os.path.join(os.path.dirname(__file__), self.path[1:]))
            self.send_response(status)
            self.end_headers()
            self.wfile.write(bytes(content, 'utf-8'))
        if self.path.startswith("/ventas"):
            ventas = leer_ventas()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(bytes(json.dumps(ventas), 'utf-8'))

    def do_POST(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        if self.path.startswith("/ventas"):
            length = int(self.headers.get('content-length'))
            field_data = self.rfile.read(length)
            fields = json.loads(field_data) 
            ventas = leer_ventas()
            venta = {"id": len(ventas) + 1, "datos": fields}
            ventas[venta["id"]] = venta
            escribir_ventas(ventas)
            self.send_response(201)
            self.end_headers()
            self.wfile.write(bytes(json.dumps(venta), 'utf-8'))


    def do_PUT(self):
        if self.path.startswith("/ventas"):
            id_venta = self.path.split('/')[-1]
            ventas = leer_ventas()
            if id_venta in ventas:
                length = int(self.headers.get('content-length'))
                field_data = self.rfile.read(length)
                fields = json.loads(field_data) 
                ventas[id_venta]["datos"] = fields
                escribir_ventas(ventas)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(bytes(json.dumps(ventas[id_venta]), 'utf-8'))
            else:
                self.send_response(404)
                self.end_headers()

    def do_DELETE(self):
        if self.path.startswith("/ventas"):
            id_venta = self.path.split('/')[-1]
            ventas = leer_ventas()
            if id_venta in ventas:
                del ventas[id_venta]
                escribir_ventas(ventas)
                self.send_response(200)
                self.end_headers()
            else:
                self.send_response(404)
                self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()
    
if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print("Servidor iniciado en http://localhost:"+str(port))
    server = HTTPServer(('localhost', port), Servidor)
    server.serve_forever()
