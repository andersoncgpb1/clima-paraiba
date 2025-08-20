const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'f1d6e106487c211e360c92271b174c2c';

// Base dos ícones no GitHub
const GITHUB_ICONS_BASE = 'https://raw.githubusercontent.com/andersoncgpb1/clima-paraiba/main/icones/';

app.use(cors());
app.use(express.json());

// Cidades da Paraíba
const cidades = [
    { id: 3397277, nome: "João Pessoa" },
    { id: 3403642, nome: "Campina Grande" },
    { id: 3389774, nome: "Santa Rita" },
    { id: 3405892, nome: "Bayeux" },
    { id: 3392929, nome: "Patos" },
    { id: 3398592, nome: "Guarabira" },
    { id: 3404575, nome: "Cabedelo" },
    { id: 3387249, nome: "Sousa" },
    { id: 3400719, nome: "Esperança" },
    { id: 3391528, nome: "Pombal" },
    { id: 3408152, nome: "Cajazeiras" },
    { id: 3406498, nome: "Bananeiras" }
];

// Mapeamento de ícones apenas do GitHub
const iconMap = {
    '01d': 'sol.png',
    '01n': 'lua-cheia.png',
    '02d': 'sol-com-nuvens.png',
    '02n': 'lua-com-nuvens.png',
    '03d': 'nublado.png',
    '03n': 'nublado.png',
    '04d': 'nublado.png',
    '04n': 'nublado.png',
    '09d': 'chuva.png',
    '09n': 'chuva.png',
    '10d': 'sol-com-chuva.png',
    '10n': 'chuva.png',
    '11d': 'chuva-com-trovao.png',
    '11n': 'chuva-com-trovao.png',
    '13d': 'nuvem-com-neve.png',
    '13n': 'nuvem-com-neve.png',
    '50d': 'neblina.png',
    '50n': 'neblina.png',
    'default': 'sol-com-nuvens.png'
};

// Fases da lua simplificadas
const moonPhaseIcons = {
    'new-moon': 'lua-nova.png',
    'waxing-crescent': 'lua-crescente.png',
    'first-quarter': 'quarto-crescente.png',
    'waxing-gibbous': 'lua-crescente-convexa.png',
    'full-moon': 'lua-cheia.png',
    'waning-gibbous': 'lua-minguante-convexa.png',
    'last-quarter': 'quarto-minguante.png',
    'waning-crescent': 'lua-minguante-concava.png'
};

// Função para data/hora em GMT-3
function getDataBrasilia() {
    return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date());
}

// Função simplificada para fase da lua
function getMoonPhase() {
    const day = new Date().getDate();
    const phases = Object.keys(moonPhaseIcons);
    return phases[day % phases.length];
}

// Seleciona ícone GitHub
function getGitHubIcon(iconCode, isNight = false) {
    let iconFile = iconMap[iconCode] || iconMap['default'];
    if (isNight && iconCode.includes('d')) {
        const nightCode = iconCode.replace('d', 'n');
        iconFile = iconMap[nightCode] || iconFile;
    }
    return GITHUB_ICONS_BASE + iconFile;
}

// Buscar dados do clima
async function fetchClima(cidadeId, cidadeNome) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?id=${cidadeId}&appid=${API_KEY}&units=metric&lang=pt`);
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        const iconeCode = data.weather[0].icon;
        const isNight = iconeCode.includes('n');
        return {
            cidade: cidadeNome,
            temperatura: Math.round(data.main.temp),
            condicao: data.weather[0].description,
            umidade: data.main.humidity,
            vento: Math.round(data.wind.speed * 3.6),
            icone: getGitHubIcon(iconeCode, isNight),
            icone_code: iconeCode,
            is_night: isNight,
            lua: moonPhaseIcons[getMoonPhase()],
            atualizado: getDataBrasilia()
        };
    } catch (error) {
        console.error(`Erro em ${cidadeNome}:`, error.message);
        return {
            cidade: cidadeNome,
            temperatura: 0,
            condicao: "Dados indisponíveis",
            umidade: 0,
            vento: 0,
            icone: GITHUB_ICONS_BASE + 'sol-com-nuvens.png',
            icone_code: "error",
            is_night: false,
            lua: moonPhaseIcons[getMoonPhase()],
            atualizado: getDataBrasilia()
        };
    }
}

// Rota principal para vMix
app.get('/clima', async (req, res) => {
    try {
        const dadosClima = await Promise.all(cidades.map(c => fetchClima(c.id, c.nome)));
        const jsonData = JSON.stringify(dadosClima, null, 2);
        if (!fs.existsSync('public')) fs.mkdirSync('public');
        fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), jsonData);
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonData);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do clima', message: error.message });
    }
});

// Endpoints auxiliares
app.get('/icones', (req, res) => {
    res.json({ github_base: GITHUB_ICONS_BASE, icon_mapping: iconMap, moon_phases: moonPhaseIcons });
});
app.use(express.static('public'));
app.get('/clima.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'clima.json')));
app.get('/health', (req, res) => res.json({ status: 'online', timestamp: new Date().toISOString(), brasilia_time: getDataBrasilia() }));
app.get('/', (req, res) => res.json({
    message: 'API Clima Paraíba - Com ícones personalizados do GitHub',
    timezone: 'GMT-3',
    current_time: getDataBrasilia(),
    github_icons: GITHUB_ICONS_BASE,
    endpoints: {
        vMix_data: '/clima',
        static_json: '/clima.json',
        icon_mapping: '/icones',
        health_check: '/health'
    }
}));

// Inicialização do servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} - Hora Brasília: ${getDataBrasilia()}`));

// Atualização automática a cada 15 minutos
setInterval(async () => {
    console.log('Atualizando dados do clima...', getDataBrasilia());
    try {
        const dadosClima = await Promise.all(cidades.map(c => fetchClima(c.id, c.nome)));
        const jsonData = JSON.stringify(dadosClima, null, 2);
        fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), jsonData);
        console.log('Dados atualizados ✅', getDataBrasilia());
    } catch (error) {
        console.error('Erro na atualização ❌', error.message);
    }
}, 15 * 60 * 1000);
