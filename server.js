const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'f1d6e106487c211e360c92271b174c2c';

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

// Mapeamento de ícones do OpenWeatherMap para emojis do Emojiterra
const emojiMap = {
    // Céu limpo
    '01d': '☀️', // Sol
    '01n': '🌙', // Lua
    
    // Poucas nuvens
    '02d': '⛅', // Sol com nuvens
    '02n': '☁️',  // Nuvem
    
    // Nublado
    '03d': '☁️', // Nuvem
    '03n': '☁️', // Nuvem
    
    // Muito nublado
    '04d': '☁️', // Nuvem
    '04n': '☁️', // Nuvem
    
    // Chuva
    '09d': '🌧️',  // Chuva
    '09n': '🌧️',  // Chuva
    
    // Chuva com sol
    '10d': '🌦️',  // Chuva com sol
    '10n': '🌧️',  // Chuva
    
    // Trovoada
    '11d': '⛈️',  // Trovoada
    '11n': '⛈️',  // Trovoada
    
    // Neve
    '13d': '❄️',  // Neve
    '13n': '❄️',  // Neve
    
    // Névoa
    '50d': '🌫️',  // Névoa
    '50n': '🌫️',  // Névoa
    
    // Default
    'default': '🌡️' // Termômetro
};

// Função para formatar data no GMT-3 (Horário de Brasília)
function getDataBrasilia() {
    const now = new Date();
    // Ajusta para GMT-3 (UTC-3)
    const offset = -3 * 60; // GMT-3 em minutos
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

// Função para obter emoji baseado no código do OpenWeatherMap
function getEmoji(iconCode) {
    return emojiMap[iconCode] || emojiMap['default'];
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
        
        // Obtém o código do ícone e o emoji correspondente
        const iconeCode = data.weather[0].icon;
        const emoji = getEmoji(iconeCode);
        const iconeUrl = `https://openweathermap.org/img/wn/${iconeCode}@2x.png`;
        
        return {
            cidade: cidadeNome,
            temperatura: Math.round(data.main.temp),
            condicao: data.weather[0].description,
            umidade: data.main.humidity,
            vento: Math.round(data.wind.speed * 3.6), // Convertendo m/s para km/h
            icone: iconeUrl,
            emoji: emoji, // Novo campo com emoji
            icone_code: iconeCode, // Código do ícone para debug
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
            icone: "https://openweathermap.org/img/wn/01d@2x.png",
            emoji: "❓", // Emoji de interrogação para erro
            icone_code: "error",
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
        
        // Formata para o vMix
        const jsonData = JSON.stringify(dadosClima, null, 2);
        
        // Salva em arquivo
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

// Rota para ver todos os emojis disponíveis
app.get('/emojis', (req, res) => {
    res.json({
        emoji_map: emojiMap,
        total_emojis: Object.keys(emojiMap).length,
        available_codes: Object.keys(emojiMap),
        usage: "Mapeamento de códigos OpenWeatherMap para emojis"
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
        service: 'Clima Paraíba API + Emojis',
        timestamp: new Date().toISOString(),
        brasilia_time: getDataBrasilia(),
        emojis_available: Object.keys(emojiMap).length,
        endpoints: {
            vMix: '/clima',
            static: '/clima.json',
            emojis: '/emojis',
            health: '/health'
        }
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API Clima Paraíba para vMix - Com Emojis 🌤️',
        timezone: 'Horário de Brasília (GMT-3)',
        current_time: getDataBrasilia(),
        features: {
            openweathermap: 'Dados meteorológicos em tempo real',
            emojiterra: 'Emojis visuais para condições climáticas',
            gmt3: 'Horário de Brasília automático',
            vmix_ready: 'JSON formatado para vMix'
        },
        endpoints: {
            vMix_data: 'https://clima-paraiba.onrender.com/clima',
            static_json: 'https://clima-paraiba.onrender.com/clima.json',
            emojis_list: 'https://clima-paraiba.onrender.com/emojis',
            health_check: 'https://clima-paraiba.onrender.com/health'
        },
        usage: 'Use no vMix: Data Source → JSON → URL: https://clima-paraiba.onrender.com/clima.json'
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Timezone: GMT-3 (Horário de Brasília)`);
    console.log(`🕒 Hora atual: ${getDataBrasilia()}`);
    console.log(`🎨 Emojis disponíveis: ${Object.keys(emojiMap).length}`);
    console.log(`🌐 Render: https://clima-paraiba.onrender.com`);
    console.log(`📊 URL vMix: https://clima-paraiba.onrender.com/clima.json`);
    console.log(`😊 Emojis: https://clima-paraiba.onrender.com/emojis`);
    
    // Criar diretório public se não existir
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
        
        // Log dos emojis usados
        dadosClima.forEach(cidade => {
            console.log(`   ${cidade.emoji} ${cidade.cidade}: ${cidade.temperatura}°C`);
        });
        
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}, 15 * 60 * 1000); // 15 minutos
