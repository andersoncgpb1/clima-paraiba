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
        
        return {
            cidade: cidadeNome,
            temperatura: Math.round(data.main.temp),
            condicao: data.weather[0].description,
            umidade: data.main.humidity,
            vento: data.wind.speed,
            icone: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
            atualizado: new Date().toLocaleString('pt-BR')
        };
    } catch (error) {
        console.error(`Erro em ${cidadeNome}:`, error.message);
        return {
            cidade: cidadeNome,
            temperatura: 0,
            condicao: "Dados indisponíveis",
            umidade: 0,
            vento: 0,
            icone: "",
            atualizado: new Date().toLocaleString('pt-BR')
        };
    }
}

// Rota principal para o vMix
app.get('/clima', async (req, res) => {
    try {
        console.log('Solicitando dados do clima...');
        
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
        console.error('Erro geral:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar dados do clima',
            message: error.message 
        });
    }
});

// Servir arquivo JSON estático
app.use(express.static('public'));

app.get('/clima.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'clima.json'));
});

// Health check para Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'online', 
        service: 'Clima Paraíba API',
        timestamp: new Date().toISOString(),
        endpoints: {
            vMix: '/clima',
            static: '/clima.json',
            health: '/health'
        }
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'API Clima Paraíba para vMix',
        endpoints: {
            vMix_data: 'https://clima-paraiba.onrender.com/clima',
            static_json: 'https://clima-paraiba.onrender.com/clima.json',
            health_check: 'https://clima-paraiba.onrender.com/health'
        },
        usage: 'Use no vMix: Data Source → JSON → URL: https://clima-paraiba.onrender.com/clima.json'
    });
});

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Render: https://clima-paraiba.onrender.com`);
    console.log(`📊 URL vMix: https://clima-paraiba.onrender.com/clima.json`);
    
    // Criar diretório public se não existir
    if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
    }
});

// Atualização automática a cada 15 minutos
setInterval(async () => {
    console.log('🔄 Atualizando dados do clima...');
    try {
        const dadosClima = await Promise.all(
            cidades.map(cidade => fetchClima(cidade.id, cidade.nome))
        );
        const jsonData = JSON.stringify(dadosClima, null, 2);
        fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), jsonData);
        console.log('✅ Dados atualizados:', new Date().toLocaleString('pt-BR'));
    } catch (error) {
        console.error('❌ Erro na atualização:', error);
    }
}, 15 * 60 * 1000); // 15 minutos
