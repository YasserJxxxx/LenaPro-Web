import os
import json
import sqlite3
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='.')
CORS(app)

JSON_FILE = 'productos.json'
DB_FILE = 'tienda.db'
UPLOAD_FOLDER = 'img'

# Aseguramos que exista la carpeta de imágenes
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ==========================================
# 1. BASE DE DATOS (SQLITE)
# ==========================================
def init_db():
    # Si borraste tienda.db, esto creará el esquema perfecto.
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT NOT NULL,
            cliente TEXT NOT NULL,
            dni TEXT,
            email TEXT,
            direccion TEXT,
            distrito TEXT,
            total REAL,
            detalles TEXT,
            estado TEXT DEFAULT 'Pendiente',
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# ==========================================
# 2. GESTIÓN DEL CATÁLOGO Y PROMOCIONES
# ==========================================
@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # LÓGICA DE EXPIRACIÓN EN TIEMPO REAL
        modificado = False
        ahora_ms = int(time.time() * 1000)
        
        for p in data.get('productos', []):
            if p.get('en_promocion') and p.get('fin_promo'):
                try:
                    # Forzamos que sea un entero para la comprobación matemática
                    fin_promo_ms = int(p['fin_promo'])
                    
                    if ahora_ms >= fin_promo_ms:
                        p['en_promocion'] = False
                        p['precio'] = p.get('precio_normal', p.get('precio')) # Restaura el precio original
                        p['fin_promo'] = None # Limpiamos la fecha
                        modificado = True
                except ValueError:
                    pass # Evita que un dato corrupto crashee el servidor

        # Si una promo expiró, reescribimos el JSON permanentemente
        if modificado:
            with open(JSON_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)

        return jsonify(data)
    
    except Exception as e:
        print("Error leyendo o procesando JSON:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos', methods=['POST'])
def guardar_producto():
    try:
        nuevo_prod = request.json
        with open(JSON_FILE, 'r+', encoding='utf-8') as f:
            data = json.load(f)
            
            if nuevo_prod.get('id'):
                for i, p in enumerate(data['productos']):
                    if p['id'] == nuevo_prod['id']:
                        data['productos'][i] = nuevo_prod
                        break
            else:
                nuevo_prod['id'] = int(os.urandom(4).hex(), 16)
                data['productos'].append(nuevo_prod)
                
            f.seek(0)
            json.dump(data, f, indent=4, ensure_ascii=False)
            f.truncate()
        return jsonify({"status": "success"})
    except Exception as e:
        print("Error guardando producto:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos/<int:prod_id>', methods=['DELETE'])
def eliminar_producto(prod_id):
    try:
        with open(JSON_FILE, 'r+', encoding='utf-8') as f:
            data = json.load(f)
            data['productos'] = [p for p in data['productos'] if p['id'] != prod_id]
            f.seek(0)
            json.dump(data, f, indent=4, ensure_ascii=False)
            f.truncate()
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# 3. SUBIDA DE IMÁGENES
# ==========================================
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'imagen' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['imagen']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        ruta_guardado = os.path.join(UPLOAD_FOLDER, filename)
        file.save(ruta_guardado)
        return jsonify({"ruta": f"img/{filename}"})

# ==========================================
# 4. GESTIÓN DE PEDIDOS (ADMIN)
# ==========================================
@app.route('/api/ordenes', methods=['POST'])
def registrar_orden():
    try:
        orden = request.json
        detalles_json = json.dumps(orden.get('carrito', []))
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''INSERT INTO pedidos (codigo, cliente, dni, email, direccion, distrito, total, detalles)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', 
                  (orden['codigo'], orden['cliente'], orden['dni'], orden['email_cliente'], 
                   orden['direccion'], orden['distrito'], orden['total'], detalles_json))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "codigo": orden['codigo']})
    except Exception as e:
        print("Error registrando orden en la base de datos:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/pedidos', methods=['GET'])
def listar_pedidos():
    try:
        estado = request.args.get('estado', 'Pendiente')
        conn = sqlite3.connect(DB_FILE)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM pedidos WHERE estado = ? ORDER BY fecha DESC', (estado,))
        pedidos = [dict(row) for row in c.fetchall()]
        conn.close()
        return jsonify(pedidos)
    except Exception as e:
        print("Error obteniendo pedidos:", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# RUTAS DE ACTUALIZACIÓN BLINDADAS
# ==========================================
@app.route('/api/admin/pedidos/<int:id>', methods=['PUT', 'POST'])
@app.route('/api/pedidos/<int:id>', methods=['PUT', 'POST']) # Ruta de respaldo
def actualizar_estado_pedido(id):
    try:
        nuevo_estado = request.json.get('estado', 'Culminado')
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('UPDATE pedidos SET estado = ? WHERE id = ?', (nuevo_estado, id))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    except Exception as e:
        print(f"Error crítico actualizando pedido {id}:", e)
        return jsonify({"error": str(e)}), 500

# ==========================================
# 5. RUTAS ESTÁTICAS (FRONTEND)
# ==========================================
@app.route('/')
def serve_index(): 
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path): 
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Usamos Threading para que no se bloquee el servidor con múltiples peticiones
    app.run(debug=True, port=5000, threaded=True)