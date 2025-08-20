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

// Cidades da Paraíba (população >10k), com ID do OpenWeatherMap
const cidades = [
  { nome: "João Pessoa", id: 3397277 },
  { nome: "Campina Grande", id: 3403642 },
  { nome: "Santa Rita", id: 3389321 },
  { nome: "Bayeux", id: 3405940 },
  { nome: "Patos", id: 3392887 },
  { nome: "Guarabira", id: 3398570 },
  { nome: "Cabedelo", id: 3404558 },
  { nome: "Sousa", id: 3387202 },
  { nome: "Esperança", id: 3400752 },
  { nome: "Pombal", id: 3391571 },
  { nome: "Cajazeiras", id: 3404020 },
  { nome: "Bananeiras", id: 3406503 },
  { nome: "Itabaiana", id: 3398003 },
  { nome: "Conde", id: 3385077 },
  { nome: "Alhandra", id: 3407940 },
  { nome: "Areia", id: 3407210 },
  { nome: "Sapé", id: 3388046 },
  { nome: "Mamanguape", id: 3395717 },
  { nome: "Cuité", id: 3401419 },
  { nome: "Picuí", id: 3392145 },
  { nome: "Catolé do Rocha", id: 3402465 },
  { nome: "São Bento", id: 3388991 },
  { nome: "Monteiro", id: 3394549 },
  { nome: "Teixeira", id: 3386533 },
  { nome: "Sumé", id: 3387130 },
  { nome: "Serra Branca", id: 3387880 }
];

// Mapeamento de ícones do GitHub
const iconMap = {
  '01d': 'sol.png',
  '01n': 'lua-cheia.png',
  '02d': 'ceu-pouco-nublado.png', // Novo ícone
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

// Fases da lua
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

// Função para hora em Brasília
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

// Função para fase da lua
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
async function fetchClima(cidade) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=${cidade.id}&appid=${API_KEY}&units=metric&lang=pt`
    );
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const data = await response.json();

    const temperatura = (data.main && data.main.temp !== 0) ? Math.round(data.main.temp) : null;
    const condicao = (data.weather && data.weather[0] && data.weather[0].description) ? data.weather[0].description : "Dados indisponíveis";
    const umidade = (data.main && data.main.humidity) ? data.main.humidity : null;
    const vento = (data.wind && data.wind.speed) ? Math.round(data.wind.speed * 3.6) : null;
    const iconeCode = (data.weather && data.weather[0] && data.weather[0].icon) ? data.weather[0].icon : '01d';
    const isNight = iconeCode.includes('n');

    return {
      cidade: cidade.nome,
      temperatura,
      condicao,
      umidade,
      vento,
      icone: getGitHubIcon(iconeCode, isNight),
      lua: moonPhaseIcons[getMoonPhase()],
      atualizado: getDataBrasilia()
    };
  } catch (error) {
    console.error(`Erro em ${cidade.nome}:`, error.message);
    return {
      cidade: cidade.nome,
      temperatura: null,
      condicao: "Dados indisponíveis",
      umidade: null,
      vento: null,
      icone: GITHUB_ICONS_BASE + 'sol-com-nuvens.png',
      lua: moonPhaseIcons[getMoonPhase()],
      atualizado: getDataBrasilia()
    };
  }
}

// Rota principal
app.get('/clima', async (req, res) => {
  try {
    const dadosClima = await Promise.all(cidades.map(c => fetchClima(c)));
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
app.get('/icones', (req, res) => res.json({ github_base: GITHUB_ICONS_BASE, icon_mapping: iconMap, moon_phases: moonPhaseIcons }));
app.use(express.static('public'));
app.get('/clima.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'clima.json')));
app.get('/health', (req, res) => res.json({ status: 'online', timestamp: new Date().toISOString(), brasilia_time: getDataBrasilia() }));

// Inicializar servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// Atualização automática a cada 15 minutos
setInterval(async () => {
  try {
    const dadosClima = await Promise.all(cidades.map(c => fetchClima(c)));
    const jsonData = JSON.stringify(dadosClima, null, 2);
    fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), jsonData);
    console.log('Dados atualizados:', getDataBrasilia());
  } catch (error) {
    console.error('Erro na atualização:', error);
  }
}, 15 * 60 * 1000);
