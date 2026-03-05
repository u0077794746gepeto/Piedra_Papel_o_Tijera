from flask import Flask, render_template, request, jsonify
import random
import json
import os

app = Flask(__name__)

RANKING_FILE = 'ranking.json'

def cargar_datos_seguro():
    """Lee el JSON y maneja errores si el archivo está vacío o no existe."""
    if not os.path.exists(RANKING_FILE) or os.stat(RANKING_FILE).st_size == 0:
        with open(RANKING_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f)
        return []
    try:
        with open(RANKING_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/jugar', methods=['POST'])
def jugar():
    try:
        datos = request.json
        eleccion_usuario = datos.get('eleccion')
        opciones = ['piedra', 'papel', 'tijera']
        eleccion_maquina = random.choice(opciones)
        
        if eleccion_usuario == eleccion_maquina:
            resultado = 'empate'
        elif (eleccion_usuario == 'piedra' and eleccion_maquina == 'tijera') or \
             (eleccion_usuario == 'papel' and eleccion_maquina == 'piedra') or \
             (eleccion_usuario == 'tijera' and eleccion_maquina == 'papel'):
            resultado = 'ganaste'
        else:
            resultado = 'perdiste'
            
        return jsonify({'maquina': eleccion_maquina, 'resultado': resultado})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/guardar_ranking', methods=['POST'])
def guardar_ranking():
    try:
        datos = request.json
        nueva_entrada = {
            'iniciales': datos.get('iniciales', 'AAA').upper()[:3],
            'puntos': int(datos.get('puntos', 0))
        }
        ranking = cargar_datos_seguro()
        ranking.append(nueva_entrada)
        ranking = sorted(ranking, key=lambda x: x['puntos'], reverse=True)
        ranking_top_10 = ranking[:10]
        with open(RANKING_FILE, 'w', encoding='utf-8') as f:
            json.dump(ranking_top_10, f, indent=4)
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/obtener_ranking', methods=['GET'])
def obtener_ranking():
    return jsonify(cargar_datos_seguro())

if __name__ == '__main__':
    app.run(debug=True, port=5000)