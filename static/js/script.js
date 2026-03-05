let puntosUsuario = 0;
let puntosMaquina = 0;
const LIMITE_VICTORIAS = 5;

// CAMBIO DE VISTAS
function mostrarJuego() {
    puntosUsuario = 0;
    puntosMaquina = 0;
    document.getElementById('puntos-usuario').innerText = '0';
    document.getElementById('puntos-maquina').innerText = '0';
    document.getElementById('resultado-ronda').innerHTML = '';
    document.getElementById('pantalla-botones').style.display = 'block';
    document.getElementById('registro-puntos').style.display = 'none';
    
    document.getElementById('vista-ranking').style.display = 'none';
    document.getElementById('vista-juego').style.display = 'block';
}

function mostrarRanking() {
    document.getElementById('vista-juego').style.display = 'none';
    document.getElementById('vista-ranking').style.display = 'block';
    cargarRanking();
}

// LÓGICA DEL JUEGO
async function jugar(arma) {
    if (puntosUsuario >= LIMITE_VICTORIAS || puntosMaquina >= LIMITE_VICTORIAS) return;

    try {
        const response = await fetch('/jugar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ eleccion: arma })
        });
        const data = await response.json();

        mostrarFeedback(arma, data.maquina, data.resultado);
        actualizarMarcador(data.resultado);
    } catch (e) { console.error(e); }
}

function mostrarFeedback(user, cpu, res) {
    const iconos = { piedra: '🪨', papel: '📄', tijera: '✂️' };
    const div = document.getElementById('resultado-ronda');
    let color = res === 'ganaste' ? '#00ff41' : (res === 'perdiste' ? '#ff00ff' : '#ffff00');
    
    div.innerHTML = `
        TU: ${iconos[user]} vs CPU: ${iconos[cpu]} <br>
        <span style="color: ${color}">¡${res.toUpperCase()}!</span>
    `;
}

function actualizarMarcador(res) {
    if (res === 'ganaste') puntosUsuario++;
    if (res === 'perdiste') puntosMaquina++;

    document.getElementById('puntos-usuario').innerText = puntosUsuario;
    document.getElementById('puntos-maquina').innerText = puntosMaquina;

    if (puntosUsuario === LIMITE_VICTORIAS || puntosMaquina === LIMITE_VICTORIAS) {
        document.getElementById('pantalla-botones').style.display = 'none';
        document.getElementById('registro-puntos').style.display = 'block';
    }
}

async function enviarPuntaje() {
    const iniciales = document.getElementById('iniciales').value.toUpperCase() || "AAA";
    await fetch('/guardar_ranking', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ iniciales: iniciales, puntos: puntosUsuario })
    });
    mostrarRanking();
}

async function cargarRanking() {
    const response = await fetch('/obtener_ranking');
    const ranking = await response.json();
    const listaDiv = document.getElementById('lista-ranking');
    
    if (ranking.length === 0) {
        listaDiv.innerHTML = "<p style='color:#444'>NO RECORDS</p>";
        return;
    }

    listaDiv.innerHTML = ranking.map((p, i) => 
        `<p>${i+1}. ${p.iniciales} <span style="color:#fff">....</span> ${p.puntos} PTS</p>`
    ).join('');
}

window.onload = cargarRanking;