class Celula {
    // estado: boolean (true = viva) o 'viva'/'muerta'
    constructor(estado = false, tiempoVida = 0) {
        if (typeof estado === 'string') {
            this.viva = estado === 'viva';
        } else {
            this.viva = Boolean(estado);
        }
        this.tiempoVida = Number(tiempoVida) || 0;
    }

    // Devuelve true si está viva
    estaViva() {
        return this.viva;
    }

    // Poner viva y reiniciar tiempo
    revive() {
        if (!this.viva) {
            this.viva = true;
            this.tiempoVida = 0;
        }
    }

    // Matar la célula y reiniciar tiempo
    matar() {
        this.viva = false;
        this.tiempoVida = 0;
    }

    // Avanza un paso de tiempo (si está viva aumenta tiempo)
    tick() {
        if (this.viva) this.tiempoVida++;
    }

    // Representación sencilla
    toString() {
        return this.viva ? 'viva' : 'muerta';
    }
}

class Tablero {
    // Por defecto crea un tablero 40x40
    constructor(filas = 40, columnas = 40) {
        this.filas = filas;
        this.columnas = columnas;
        this.matriz = [];
        this.crearMatriz();
    }

    // Crea la matriz de Celula (todos muertos por defecto)
    crearMatriz() {
        this.matriz = new Array(this.filas);
        for (let r = 0; r < this.filas; r++) {
            this.matriz[r] = new Array(this.columnas);
            for (let c = 0; c < this.columnas; c++) {
                this.matriz[r][c] = new Celula(false, 0);
            }
        }
    }

    // Obtener la célula en (r, c) — devuelve null si fuera de rango
    getCelula(r, c) {
        if (r < 0 || r >= this.filas || c < 0 || c >= this.columnas) return null;
        return this.matriz[r][c];
    }

    // Cambiar el estado de una célula: estado puede ser booleano o 'viva'/'muerta'
    setEstado(r, c, estado) {
        const cel = this.getCelula(r, c);
        if (!cel) return false;
        const viva = typeof estado === 'boolean' ? estado : estado === 'viva';
        if (viva) cel.revive(); else cel.matar();
        return true;
    }

    // Reinicia todo el tablero a células muertas
    reiniciar() {
        for (let r = 0; r < this.filas; r++) {
            for (let c = 0; c < this.columnas; c++) {
                this.matriz[r][c].matar();
            }
        }
    }

    // Aleatoriza el tablero; prob = probabilidad de que una célula nazca
    randomizar(prob = 0.3) {
        for (let r = 0; r < this.filas; r++) {
            for (let c = 0; c < this.columnas; c++) {
                if (Math.random() < prob) this.matriz[r][c].revive(); else this.matriz[r][c].matar();
            }
        }
    }

    // --- Funciones del Juego de la Vida ---
    // Contar vecinas vivas con borde toroidal (envuelve)
    contarVecinasToroidal(r, c) {
        let contador = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                // índice envuelto
                const rr = (r + dr + this.filas) % this.filas;
                const cc = (c + dc + this.columnas) % this.columnas;
                if (this.matriz[rr][cc].estaViva()) contador++;
            }
        }
        return contador;
    }

    // Calcula y aplica la siguiente generación usando las reglas:
    // - célula muerta con exactamente 3 vecinas vivas -> nace
    // - célula viva con 2 o 3 vecinas vivas -> sigue viva
    // - en otro caso muere o permanece muerta
    siguienteGeneracion() {
        // Crear una matriz temporal con los nuevos estados
        const nuevosEstados = new Array(this.filas);
        for (let r = 0; r < this.filas; r++) {
            nuevosEstados[r] = new Array(this.columnas);
            for (let c = 0; c < this.columnas; c++) {
                const cel = this.matriz[r][c];
                const vecinas = this.contarVecinasToroidal(r, c);
                let nuevaViva = false;
                if (!cel.estaViva() && vecinas === 3) nuevaViva = true;
                else if (cel.estaViva() && (vecinas === 2 || vecinas === 3)) nuevaViva = true;
                nuevosEstados[r][c] = nuevaViva;
            }
        }

        // Aplicar los nuevos estados y actualizar tiempo de vida
        for (let r = 0; r < this.filas; r++) {
            for (let c = 0; c < this.columnas; c++) {
                const cel = this.matriz[r][c];
                if (nuevosEstados[r][c]) {
                    if (!cel.estaViva()) cel.revive();
                    else cel.tick();
                } else {
                    cel.matar();
                }
            }
        }
    }

    // Aplicar un patrón predefinido centrado en (r,c)
    // Patrones disponibles: 'single', 'block', 'blinker', 'glider'
    aplicarPatron(r, c, nombre = 'single') {
        const patrones = {
            single: [[0,0]],
            block: [[0,0],[0,1],[1,0],[1,1]],
            blinker: [[0,0],[0,1],[0,2]],
            glider: [[0,1],[1,2],[2,0],[2,1],[2,2]]
        };

        const pattern = patrones[nombre];
        if (!pattern) return false;

        // Aplicar patrón con su esquina superior izquierda en (r,c)
        for (const [dr, dc] of pattern) {
            const rr = (r + dr + this.filas) % this.filas;
            const cc = (c + dc + this.columnas) % this.columnas;
            this.setEstado(rr, cc, true);
        }
        return true;
    }

    // Alternativa: alterna una célula entre viva/muerta (útil para clicks simples)
    alternarEstado(r, c) {
        const cel = this.getCelula(r, c);
        if (!cel) return false;
        if (cel.estaViva()) cel.matar(); else cel.revive();
        return true;
    }

    // Representación simple para debug (matriz de 0/1)
    toMatrix() {
        const m = [];
        for (let r = 0; r < this.filas; r++) {
            m[r] = [];
            for (let c = 0; c < this.columnas; c++) {
                m[r][c] = this.matriz[r][c].estaViva() ? 1 : 0;
            }
        }
        return m;
    }
}

// Uso (ejemplo):
// const tablero = new Tablero();
// tablero.randomizar(0.2);
// console.log(tablero.getCelula(0,0).toString());
