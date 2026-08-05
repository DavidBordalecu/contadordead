// Configuración y Estado usando localStorage para persistencia
const STORAGE_KEY = "censo_temporal_state";

let state = loadState();

function getDefaultState() {
    return {
        totalCount: 0,
        currentDayCount: 0,
        currentMonthCount: 0,
        lastTimestamp: Date.now(),
        dailyRecords: [], // { dateString, count }
        yearlyRecords: []  // { monthString, count }
    };
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getDefaultState();
    try {
        return JSON.parse(saved);
    } catch (e) {
        return getDefaultState();
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Tasas estimadas de mortalidad mundial por segundo (aprox 1.8 a 2 personas por segundo en la vida real,
// pero adaptamos la simulación con la variación requerida de 10 a 100 por ciclo/lapso si se desea, 
// o un incremento fluido por segundo basado en un rango dinámico).
function getDynamicIncrement() {
    // Genera un valor aleatorio entre 10 y 100 por intervalo de actualización o segundo, 
    // tal como solicitaste la variación final de 10 a 100.
    return Math.floor(Math.random() * (100 - 10 + 1)) + 10;
}

// Referencias del DOM
const counterDisplay = document.getElementById("counter-display");
const dailyContainer = document.getElementById("daily-container");
const yearlyContainer = document.getElementById("yearly-container");

function render() {
    counterDisplay.textContent = state.totalCount.toLocaleString();
    renderTombstones();
}

function renderTombstones() {
    // Renderizar lápidas diarias
    dailyContainer.innerHTML = "";
    state.dailyRecords.forEach(record => {
        const card = document.createElement("div");
        card.className = "tombstone";
        card.innerHTML = `
            <div class="tombstone-date">${record.date}</div>
            <div class="tombstone-count">${record.count.toLocaleString()}</div>
            <div class="tombstone-footer">Desანსos</div>
        `;
        dailyContainer.appendChild(card);
    });

    // Renderizar lápidas mensuales (si existen)
    yearlyContainer.innerHTML = "";
    state.yearlyRecords.forEach(record => {
        const card = document.createElement("div");
        card.className = "tombstone monthly";
        card.innerHTML = `
            <div class="tombstone-date">${record.month}</div>
            <div class="tombstone-count">${record.count.toLocaleString()}</div>
            <div class="tombstone-footer">Ciclo Mensual</div>
        `;
        yearlyContainer.appendChild(card);
    });
}

// Control del tiempo transcurrido (Simulación de 24 horas por día)
// Para pruebas rápidas puedes disminuir MS_PER_DAY, 
// para producción real de 24 horas usar: 24 * 60 * 60 * 1000
const MS_PER_DAY = 24 * 60 * 60 * 1000; 

function checkTimeProgression() {
    const now = Date.now();
    const elapsed = now - state.lastTimestamp;

    // Si ha pasado 24 horas (o el ciclo establecido)
    if (elapsed >= MS_PER_DAY) {
        finalizeDay();
        state.lastTimestamp = now;
    }
}

function finalizeDay() {
    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Guardar registro diario
    state.dailyRecords.unshift({
        date: dateStr,
        count: state.currentDayCount
    });

    // Acumular al mes actual
    state.currentMonthCount += state.currentDayCount;
    state.currentDayCount = 0; // Reiniciar contador diario

    // Verificar si se completó un mes (asumiendo 30 días o cierre de ciclo de 30 lápidas diarias)
    if (state.dailyRecords.length >= 30) {
        finalizeMonth();
    }

    saveState();
}

function finalizeMonth() {
    const monthStr = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    state.yearlyRecords.unshift({
        month: monthStr,
        count: state.currentMonthCount
    });

    // Reemplazar / limpiar las lápidas diarias al consolidar el mes
    state.dailyRecords = [];
    state.currentMonthCount = 0;

    // Si se juntan 12 lápidas anuales, se puede hacer manejo adicional si se requiere
    if (state.yearlyRecords.length > 12) {
        state.yearlyRecords.pop(); // Mantener un límite anual coherente
    }

    saveState();
}

// Bucle Principal (Ejecución por segundo)
setInterval(() => {
    const increment = getDynamicIncrement();
    state.totalCount += increment;
    state.currentDayCount += increment;

    checkTimeProgression();
    saveState();
    render();
}, 1000);

// Inicializar vista
render();