// Sonidos actualizados (Ciberpunk 2077 Style)
const sounds = {
    click: document.getElementById('snd-click'),
    error: document.getElementById('snd-error'),
    glitch: document.getElementById('snd-glitch')
};

function playSnd(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].volume = 0.6;
        sounds[name].play().catch(() => {});
    }
}

// Manejo de pestañas con sonido
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        playSnd('glitch');
        const tabId = button.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Modal de Error con Efectos Espectaculares
function showError(msg) {
    playSnd('error');
    document.body.classList.add('system-failure');
    document.getElementById('error-overlay').style.display = 'block';
    document.getElementById('error-msg').innerText = msg;
    document.getElementById('error-modal').style.display = 'block';
}

function closeModal() {
    playSnd('click');
    document.body.classList.remove('system-failure');
    document.getElementById('error-overlay').style.display = 'none';
    document.getElementById('error-modal').style.display = 'none';
}

// --- Variables Globales ---
let currentData = [];
let histogramChart, ojivaChart, paretoChart;

// --- Funciones de Utilidad ---
function factorial(n) {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

function parseInput(input) {
    return input.split(/[\s,]+/)
                .map(n => parseFloat(n))
                .filter(n => !isNaN(n));
}

function renderDataChips(data) {
    const container = document.getElementById('data-preview');
    container.innerHTML = '<h3 style="color:var(--primary-color); margin-bottom:10px; font-size:0.8rem;">CHIPS_DE_MEMORIA_CARGADOS:</h3>';
    data.forEach(n => {
        const chip = document.createElement('div');
        chip.className = 'data-chip';
        chip.innerText = n;
        container.appendChild(chip);
    });
}

// --- Generación de Datos ---
document.getElementById('btn-random').addEventListener('click', () => {
    playSnd('click');
    const randomData = Array.from({ length: 25 }, () => Math.floor(Math.random() * 100));
    document.getElementById('data-input').value = randomData.join(', ');
    renderDataChips(randomData);
});

document.getElementById('btn-clear').addEventListener('click', () => {
    playSnd('error');
    document.getElementById('data-input').value = '';
    document.getElementById('data-preview').innerHTML = '';
    document.getElementById('stats-output').innerHTML = '<p>ESPERANDO_DATOS_PARA_ANALIZAR...</p>';
    document.getElementById('freq-table-body').innerHTML = '';
    if (histogramChart) histogramChart.destroy();
    if (ojivaChart) ojivaChart.destroy();
    if (paretoChart) paretoChart.destroy();
});

// --- Procesamiento Principal ---
document.getElementById('btn-process').addEventListener('click', () => {
    playSnd('click');
    const rawInput = document.getElementById('data-input').value;
    
    // Validación de caracteres
    if (/[a-zA-Z]/.test(rawInput)) {
        showError("ERROR_DE_SISTEMA: Caracteres no autorizados detectados.");
        return;
    }

    currentData = parseInput(rawInput);

    if (currentData.length < 20) {
        showError("DATOS_INSUFICIENTES: Se requieren al menos 20 valores numéricos.");
        return;
    }

    renderDataChips(currentData);
    calculateStatistics(currentData);
    const freqData = generateFrequencyTable(currentData);
    updateCharts(freqData);
});

function calculateStatistics(data) {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    let median;
    if (n % 2 === 0) {
        median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
        median = sorted[Math.floor(n / 2)];
    }

    const counts = {};
    data.forEach(x => counts[x] = (counts[x] || 0) + 1);
    let maxFreq = 0;
    let modes = [];
    for (const val in counts) {
        if (counts[val] > maxFreq) {
            maxFreq = counts[val];
            modes = [val];
        } else if (counts[val] === maxFreq) {
            modes.push(val);
        }
    }
    const modeResult = (modes.length === Object.keys(counts).length && n > 1) ? "No hay moda" : modes.join(", ");

    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    const output = `
        <div class="stat-item"><strong>Media:</strong> ${mean.toFixed(2)}</div>
        <div class="stat-item"><strong>Mediana:</strong> ${median}</div>
        <div class="stat-item"><strong>Moda:</strong> ${modeResult}</div>
        <div class="stat-item"><strong>Mínimo:</strong> ${min}</div>
        <div class="stat-item"><strong>Máximo:</strong> ${max}</div>
        <div class="stat-item"><strong>Rango:</strong> ${range}</div>
    `;
    document.getElementById('stats-output').innerHTML = output;
}

function generateFrequencyTable(data) {
    const counts = {};
    data.forEach(x => counts[x] = (counts[x] || 0) + 1);
    const sortedValues = Object.keys(counts).sort((a, b) => a - b);
    const n = data.length;
    let accumulatedFi = 0;
    let html = '';
    const tableData = [];

    sortedValues.forEach(val => {
        const fi = counts[val];
        const fr = fi / n;
        accumulatedFi += fi;
        const Fr = accumulatedFi / n;
        tableData.push({ val, fi, fr, Fi: accumulatedFi, Fr });
        html += `<tr><td>${val}</td><td>${fi}</td><td>${fr.toFixed(4)}</td><td>${accumulatedFi}</td><td>${Fr.toFixed(4)}</td></tr>`;
    });
    document.getElementById('freq-table-body').innerHTML = html;
    return tableData;
}

function updateCharts(freqData) {
    const labels = freqData.map(d => d.val);
    const fiData = freqData.map(d => d.fi);
    const FrData = freqData.map(d => d.Fr * 100);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#fcee0a', font: { family: 'JetBrains Mono' } } } },
        scales: {
            x: { grid: { color: 'rgba(252, 238, 10, 0.1)' }, ticks: { color: '#fcee0a' } },
            y: { grid: { color: 'rgba(252, 238, 10, 0.1)' }, ticks: { color: '#fcee0a' } }
        }
    };

    if (histogramChart) histogramChart.destroy();
    histogramChart = new Chart(document.getElementById('histogramChart'), {
        data: {
            labels: labels,
            datasets: [{ type: 'bar', label: 'fi', data: fiData, backgroundColor: 'rgba(0, 240, 255, 0.3)', borderColor: '#00f0ff', borderWidth: 1 },
                       { type: 'line', label: 'Polígono', data: fiData, borderColor: '#ff003c', tension: 0.3, fill: false }]
        },
        options: chartOptions
    });

    if (ojivaChart) ojivaChart.destroy();
    ojivaChart = new Chart(document.getElementById('ojivaChart'), {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'Fi (%)', data: FrData, borderColor: '#bc13fe', backgroundColor: 'rgba(188, 19, 254, 0.2)', fill: true, tension: 0.3 }] },
        options: chartOptions
    });

    const paretoSorted = [...freqData].sort((a, b) => b.fi - a.fi);
    const paretoLabels = paretoSorted.map(d => d.val);
    const paretoFi = paretoSorted.map(d => d.fi);
    let acc = 0;
    const total = paretoFi.reduce((a, b) => a + b, 0);
    const paretoAccPercent = paretoFi.map(f => { acc += f; return (acc / total) * 100; });

    if (paretoChart) paretoChart.destroy();
    const paretoOptions = JSON.parse(JSON.stringify(chartOptions));
    paretoOptions.scales.y1 = { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false }, ticks: { color: '#ff003c' } };
    paretoChart = new Chart(document.getElementById('paretoChart'), {
        data: {
            labels: paretoLabels,
            datasets: [{ type: 'bar', label: 'fi', data: paretoFi, backgroundColor: 'rgba(252, 238, 10, 0.6)' },
                       { type: 'line', label: '% Acum', data: paretoAccPercent, borderColor: '#ff003c', yAxisID: 'y1' }]
        },
        options: paretoOptions
    });
}

// Probabilidad, Combinatoria y Conjuntos (Lógica igual, solo sonido click)
document.getElementById('btn-calc-prob').addEventListener('click', () => {
    playSnd('click');
    const fav = parseFloat(document.getElementById('fav-cases').value);
    const total = parseFloat(document.getElementById('total-cases').value);
    if (total <= 0) return showError("ERROR: El total debe ser > 0");
    const prob = fav / total;
    document.getElementById('prob-result').innerHTML = `P(E) = ${fav}/${total} = <strong>${prob.toFixed(4)}</strong>`;
});

document.getElementById('btn-perm').addEventListener('click', () => {
    playSnd('click');
    const n = parseInt(document.getElementById('n-val').value);
    const r = parseInt(document.getElementById('r-val').value);
    if (n < r) return showError("ERROR: n >= r requerido.");
    const res = factorial(n) / factorial(n - r);
    document.getElementById('combinatoria-result').innerText = `P(${n},${r}) = ${res}`;
});

document.getElementById('btn-comb').addEventListener('click', () => {
    playSnd('click');
    const n = parseInt(document.getElementById('n-val').value);
    const r = parseInt(document.getElementById('r-val').value);
    if (n < r) return showError("ERROR: n >= r requerido.");
    const res = factorial(n) / (factorial(r) * factorial(n - r));
    document.getElementById('combinatoria-result').innerText = `C(${n},${r}) = ${res}`;
});

function getSets() {
    const setA = new Set(parseInput(document.getElementById('set-a').value));
    const setB = new Set(parseInput(document.getElementById('set-b').value));
    return { setA, setB };
}

document.getElementById('btn-union').addEventListener('click', () => {
    playSnd('click');
    const { setA, setB } = getSets();
    document.getElementById('sets-result').innerText = `A ∪ B = { ${[...new Set([...setA, ...setB])].join(', ')} }`;
});

document.getElementById('btn-inter').addEventListener('click', () => {
    playSnd('click');
    const { setA, setB } = getSets();
    document.getElementById('sets-result').innerText = `A ∩ B = { ${[...setA].filter(x => setB.has(x)).join(', ')} }`;
});

document.getElementById('btn-diff').addEventListener('click', () => {
    playSnd('click');
    const { setA, setB } = getSets();
    document.getElementById('sets-result').innerText = `A - B = { ${[...setA].filter(x => !setB.has(x)).join(', ')} }`;
});

document.getElementById('btn-tree').addEventListener('click', () => {
    playSnd('glitch');
    const input = document.getElementById('tree-input').value;
    const maxLevels = parseInt(document.getElementById('tree-levels').value);
    
    if (!input) return showError("Ingresa ramas (A:0.5, B:0.5)");
    
    try {
        const baseBranches = input.split(',').map(b => {
            const parts = b.trim().split(':');
            if (parts.length !== 2) throw new Error();
            return { label: parts[0].trim(), prob: parseFloat(parts[1].trim()) };
        });

        const container = document.getElementById('tree-container');
        const width = container.clientWidth || 800;
        const height = 500;
        
        let svgContent = "";
        
        function drawLevel(parentX, parentY, currentLevel, currentProb, startY, endY) {
            if (currentLevel > maxLevels) return;

            const x = 80 + (currentLevel * (width - 200) / maxLevels);
            const availableHeight = endY - startY;
            const stepY = availableHeight / baseBranches.length;

            baseBranches.forEach((branch, i) => {
                const y = startY + (stepY * i) + (stepY / 2);
                
                // Línea desde el padre
                svgContent += `<path d="M ${parentX} ${parentY} L ${x} ${y}" class="tree-line" />`;
                
                // Texto de Probabilidad sobre la línea
                const midX = parentX + (x - parentX) * 0.5;
                const midY = parentY + (y - parentY) * 0.5 - 5;
                svgContent += `<text x="${midX}" y="${midY}" text-anchor="middle" class="tree-prob" style="font-size:10px;">${branch.prob}</text>`;
                
                // Nodo
                const pW = 80;
                const pH = 24;
                const points = `${x},${y} ${x+10},${y-pH/2} ${x+pW},${y-pH/2} ${x+pW},${y+pH/2} ${x+10},${y+pH/2}`;
                svgContent += `<polygon points="${points}" class="tree-node" />`;
                svgContent += `<text x="${x + pW/2 + 5}" y="${y + 4}" text-anchor="middle" class="tree-text" style="font-size:10px;">${branch.label}</text>`;

                // Llamada recursiva para el siguiente nivel
                drawLevel(x + pW, y, currentLevel + 1, currentProb * branch.prob, startY + (stepY * i), startY + (stepY * (i + 1)));
            });
        }

        // Nodo Raíz
        const rootX = 40;
        const rootY = height / 2;
        svgContent += `<circle cx="${rootX}" cy="${rootY}" r="20" class="tree-node" />`;
        svgContent += `<text x="${rootX}" y="${rootY + 5}" text-anchor="middle" class="tree-text" style="font-size:16px;">Ω</text>`;

        drawLevel(rootX + 20, rootY, 1, 1, 0, height);

        const svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width:100%;">${svgContent}</svg>`;
        container.innerHTML = svg;

    } catch (e) {
        showError("FORMATO_INVÁLIDO: Usa Nodo:Probabilidad (ej. Sol:0.5, Aguila:0.5)");
    }
});
