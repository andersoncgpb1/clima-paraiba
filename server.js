const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'f1d6e106487c211e360c92271b174c2c';

// URL base dos seus ícones no GitHub
const GITHUB_ICONS_BASE = 'https://raw.githubusercontent.com/andersoncgpb1/clima-paraiba/main/icones/';

app.use(cors());
app.use(express.json());

// Lista de cidades da Paraíba para o vMix
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

// Mapeamento de ícones do OpenWeatherMap para seus arquivos do GitHub
const iconMap = {
    // Céu limpo
    '01d': 'sol.png', // Sol
    '01n': 'lua-cheia.png', // Lua cheia
    
    // Poucas nuvens
    '02d': 'sol-com-nuvens.png', // Sol com nuvens
    '02n': 'lua-com-nuvens.png', // Lua com nuvens
    
    // Nublado
    '03d': 'nublado.png', // Nublado
    '03n': 'nublado.png', // Nublado
    
    // Muito nublado
    '04d': 'nublado.png', // Nublado
    '04n': 'nublado.png', // Nublado
    
    // Chuva
    '09d': 'chuva.png', // Chuva
    '09n': 'chuva.png', // Chuva
    
    // Chuva com sol
    '10d': 'sol-com-chuva.png', // Sol com chuva
    '10n': 'chuva.png', // Chuva (noite)
    
    // Trovoada
    '11d': 'chuva-com-trovao.png', // Chuva com trovão
    '11n': 'chuva-com-trovao.png', // Chuva com trovão
    
    // Neve
    '13d': 'nuvem-com-neve.png', // Neve
    '13n': 'nuvem-com-neve.png', // Neve
    
    // Névoa
    '50d': 'neblina.png', // Neblina
    '50n': 'neblina.png', // Neblina
    
    // Default
    'default': 'sol-com-nuvens.png' // Default
};

// Mapeamento adicional para fases da lua baseado na hora
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

// Função para formatar data no GMT-3 (Horário de Brasília)
function getDataBrasilia() {
    const now = new Date();
    const offset = -3 * 60;
    const brasiliaTime = new Date(now.getTime() + offset * 60 * 1000);
    
    return brasiliaTime.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Função para determinar fase da lua (simplificada)
function getMoonPhase() {
    const now = new Date();
    const day = now.getDate();
    // Simulação simples baseada no dia do mês
    const phases = Object.keys(moonPhaseIcons);
    return phases[day % phases.length];
}

// Função para obter ícone do GitHub baseado no código do OpenWeatherMap
function getGitHubIcon(iconCode, isNight = false) {
    let iconFile = iconMap[iconCode] || iconMap['default'];
    
    // Se for noite e for um ícone diurno, tenta encontrar versão noturna
    if (isNight && iconCode.includes('d')) {
        const nightCode = iconCode.replace('d', 'n');
        iconFile = iconMap[nightCode] || iconFile;
    }
    
    return GITHUB_ICONS_BASE + iconFile;
}

// Função para buscar dados do OpenWeatherMap
async function fetchClima(cidadeId, cidadeNome) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?id=${cidadeId}&appid=${API_KEY}&units=metric&lang=pt`
        );
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const iconeCode = data.weather[0].icon;
        const isNight = iconeCode.includes('n');
        
        // Ícone do GitHub
        const githubIcon = getGitHubIcon(iconeCode, isNight);
        
        // Ícone original do OpenWeatherMap (para backup)
        const owmIcon = `https://openweathermap.org/img/wn/${iconeCode}@2x.png`;
        
        return {
            cidade: cidadeNome,
            temperatura: Math.round(data.main.temp),
            condicao: data.weather[0].description,
            umidade: data.main.humidity,
            vento: Math.round(data.wind.speed * 3.6),
            icone: githubIcon, // Seu ícone do GitHub
            icone_owm: owmIcon, // Ícone original (backup)
            icone_code: iconeCode,
            is_night: isNight,
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
            icone: GITHUB_ICONS_BASE + 'sol-com-nuvens.png', // Ícone default do seu GitHub
            icone_owm: "https://openweathermap.org/img/wn/01d@2x.png",
            icone_code: "error",
            is_night: false,
            atualizado: getDataBrasilia()
        };
    }
}

// Rota principal para o vMix
app.get('/clima', async (req, res) => {
    try {
        console.log('📡 Solicitando dados do clima...', getDataBrasilia());
        
        const dadosClima = await Promise.all(
            cidades.map(cidade => fetchClima(cidade.id, cidade.nome))
        );
        
        const jsonData = JSON.stringify(dadosClima, null, 2);
        fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), jsonData);
        
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonData);
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar dados do clima',
            message: error.message,
            atualizado: getDataBrasilia()
        });
    }
});

// Rota para ver mapeamento de ícones
app.get('/icones', (req, res) => {
    res.json({
        github_base: GITHUB_ICONS_BASE,
        icon_mapping: iconMap,
        moon_phases: moonPhaseIcons,
        total_icons: Object.keys(iconMap).length,
        available_files: Object.values(iconMap)
    });
});

// Servir arquivo JSON estático
app.use(express.static('public'));

app.get('/clima.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'clima.json'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online', 
        service: 'Clima Paraíba API - Ícones Personalizados',
        timestamp: new Date().toISOString(),
        brasilia_time: getDataBrasilia(),
        github_icons: GITHUB_ICONS_BASE,
        endpoints: {
            vMix: '/clima',
            static: '/clima.json',
            icones: '/icones',
            health: '/health'
        }
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API Clima Paraíba - Com seus ícones personalizados 🎨',
        timezone: 'Horário de Brasília (GMT-3)',
        current_time: getDataBrasilia(),
        github_icons: GITHUB_ICONS_BASE,
        features: 'Ícones personalizados do seu GitHub',
        endpoints: {
            vMix_data: 'https://clima-paraiba.onrender.com/clima',
            static_json: 'https://clima-paraiba.onrender.com/clima.json',
            icon_mapping: 'https://clima-paraiba.onrender.com/icones',
            health_check: 'https://clima-paraiba.onrender.com/health'
        }
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Timezone: GMT-3 (Horário de Brasília)`);
    console.log(`🕒 Hora atual: ${getDataBrasilia()}`);
    console.log(`🎨 Ícones GitHub: ${GITHUB_ICONS_BASE}`);
    console.log(`🌐 Render: https://clima-paraiba.onrender.com`);
    console.log(`📊 URL vMix: https://clima-paraiba.onrender.com/clima.json`);
    console.log(`🖼️ Mapeamento: https://clima-paraiba.onrender.com/icones`);
    
    if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
    }
});

// Atualização automática a cada 15 minutos
setInterval(async () => {
    console.log('🔄 Atualizando dados do clima...', getDataBrasilia());
    try {
        const dadosClima = await Promise.all(
            cidades.map(cidade => fetchClima(cidade.id, cidade.nome))
        );
        const jsonData = JSON.stringify(dadosClima, null, 2);
        fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), jsonData);
        console.log('✅ Dados atualizados:', getDataBrasilia());
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}, 15 * 60 * 1000);
