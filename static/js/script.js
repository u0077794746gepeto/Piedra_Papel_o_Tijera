let puntosUsuario = 0;
let puntosMaquina = 0;
const LIMITE_VICTORIAS = 5;

// 1. Lógica principal de cada ronda
async function jugar(armaElegida) {
    if (puntosUsuario >= LIMITE_VICTORIAS || puntosMaquina >= LIMITE_VICTORIAS) return;

    try {
        const response = await fetch('/jugar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ eleccion: armaElegida })
        });
        
        const data = await response.json();

        if (data.error) {
            console.error("Error del servidor:", data.error);
            return;
        }

        mostrarResultadoRonda(armaElegida, data.maquina, data.resultado);
        actualizarMarcador(data.resultado);

    } catch (error) {
        console.error("Error en la petición:", error);
    }
}

// 2. Mostrar elecciones en pantalla
function mostrarResultadoRonda(usuario, maquina, resultado) {
    const iconos = { piedra: '🪨', papel: '📄', tijera: '✂️' };
    const divResultado = document.getElementById('resultado-ronda');
    
    let color = "#00ff41"; // Verde para ganar
    if (resultado === 'perdiste') color = "#ff00ff"; // Rosa para perder
    if (resultado === 'empate') color = "#ffff00"; // Amarillo para empate

    divResultado.innerHTML = `
        TU: ${iconos[usuario]} vs CPU: ${iconos[maquina]} <br>
        <span style="color: ${color}">¡${resultado.toUpperCase()}!</span>
    `;
}

// 3. Controlar el marcador global
function actualizarMarcador(resultado) {
    if (resultado === 'ganaste') puntosUsuario++;
    if (resultado === 'perdiste') puntosMaquina++;

    document.getElementById('puntos-usuario').innerText = puntosUsuario;
    document.getElementById('puntos-maquina').innerText = puntosMaquina;

    if (puntosUsuario === LIMITE_VICTORIAS || puntosMaquina === LIMITE_VICTORIAS) {
        finalizarPartida();
    }
}

function finalizarPartida() {
    document.getElementById('pantalla-juego').style.display = 'none';
    document.getElementById('registro-puntos').style.display = 'block';
}

// 4. Guardar récord en el JSON
async function enviarPuntaje() {
    const iniciales = document.getElementById('iniciales').value || "AAA";
    
    await fetch('/guardar_ranking', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            iniciales: iniciales,
            puntos: puntosUsuario
        })
    });

    location.reload();
}

// 5. Cargar ranking al iniciar
async function cargarRanking() {
    const response = await fetch('/obtener_ranking');
    const ranking = await response.json();
    const listaDiv = document.getElementById('lista-ranking');
    
    if (ranking.length === 0) {
        listaDiv.innerHTML = "<p>NO HAY RÉCORDS AÚN</p>";
        return;
    }

    listaDiv.innerHTML = ranking.map((p, i) => 
        `<p>${i+1}. ${p.iniciales} .... ${p.puntos} PTS</p>`
    ).join('');
}

window.onload = cargarRanking;