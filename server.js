const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = 'f1d6e106487c211e360c92271b174c2c';

app.use(cors());
app.use(express.json());

// Lista de cidades da Paraíba
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

// Função para buscar dados do clima
async function fetchClima(cidadeId, cidadeNome) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?id=${cidadeId}&appid=${API_KEY}&units=metric&lang=pt`
        );
        
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
        console.error(`Erro em ${cidadeNome}:`, error);
        return {
            cidade: cidadeNome,
            temperatura: "N/A",
            condicao: "Dados indisponíveis",
            umidade: "N/A",
            vento: "N/A",
            icone: "",
            atualizado: new Date().toLocaleString('pt-BR')
        };
    }
}

// Rota principal - retorna JSON para o vMix
app.get('/clima', async (req, res) => {
    try {
        const dadosClima = await Promise.all(
            cidades.map(cidade => fetchClima(cidade.id, cidade.nome))
        );
        
        // Salva em arquivo JSON
        const jsonData = JSON.stringify(dadosClima, null, 2);
        fs.writeFileSync('clima.json', jsonData);
        
        res.json(dadosClima);
    } catch (error) {
        console.error('Erro geral:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do clima' });
    }
});

// Servir arquivo estático JSON
app.get('/clima.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'clima.json'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`URL para vMix: http://localhost:${PORT}/clima`);
    console.log(`JSON estático: http://localhost:${PORT}/clima.json`);
});

// Atualiza os dados a cada 10 minutos
setInterval(async () => {
    console.log('Atualizando dados do clima...');
    const dadosClima = await Promise.all(
        cidades.map(cidade => fetchClima(cidade.id, cidade.nome))
    );
    const jsonData = JSON.stringify(dadosClima, null, 2);
    fs.writeFileSync('clima.json', jsonData);
    console.log('Dados atualizados:', new Date().toLocaleString('pt-BR'));
}, 10 * 60 * 1000);
