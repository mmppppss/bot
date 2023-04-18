/// blackjack

// Definir las variables
let cartasJugador = [];
let cartasCasa = [];
let puntosJugador = 0;
let puntosCasa = 0;
let win=5;
// Función para repartir cartas
  // Generar cartas aleatorias
  for (let i = 0; i < 2; i++) {
    let cartaAleatoria = Math.floor(Math.random() * 10) + 1;
    cartasJugador.push(cartaAleatoria);
    let cartaAleatoria2 = Math.floor(Math.random() * 10) + 1;
    cartasCasa.push(cartaAleatoria2);
  }
calcularPuntos();
// Función para calcular los puntos
function calcularPuntos() {
  // Calcular los puntos del jugador
  for (let i = 0; i < cartasJugador.length; i++) {
    puntosJugador += cartasJugador[i];
  }
  // Calcular los puntos de la casa
  for (let i = 0; i < cartasCasa.length; i++) {
    puntosCasa += cartasCasa[i];
  }
    determinarGanador()
}

// Función para determinar el ganador
function determinarGanador() {
  // Si el jugador tiene 21 puntos, gana
  if (puntosJugador === 21) {
    win=1;
  }
  // Si la casa tiene 21 puntos, gana
  else if (puntosCasa === 21) {
    win=0;
  }
  // Si el jugador tiene más puntos que la casa, gana
  else if (puntosJugador > puntosCasa) {
    win=1;
  }
  // Si la casa tiene más puntos que el jugador, gana
  else if (puntosCasa > puntosJugador) {
    win=0;
  }
  // Si el jugador y la casa tienen los mismos puntos, es un empate
  else if (puntosJugador === puntosCasa) {
    win=2;
  }
return win;
}
export win
