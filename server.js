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

const DELAY_MS = 800;

const iconMap = {
  '01d': 'Ensolarado.png',
  '01n': 'Nublado Noite.png',
  '02d': 'Nublado com Sol.png',
  '02n': 'Nublado Noite.png',
  '03d': 'Nublado.png',
  '03n': 'Nublado Noite.png',
  '04d': 'Nublado.png',
  '04n': 'Nublado Noite.png',
  '09d': 'Chuva.png',
  '09n': 'Chuva Noite.png',
  '10d': 'Chuva com Sol.png',
  '10n': 'Chuva Noite.png',
  '11d': 'Tempestade com sol.png',
  '11n': 'Tempestade Noite.png',
  '13d': 'Nublado.png',
  '13n': 'Nublado Noite.png',
  '50d': 'Nublado.png',
  '50n': 'Nublado Noite.png'
};

const getIcon = (iconCode) => `/icones/${iconMap[iconCode] || 'Nublado.png'}`;

// CIDADES COM IDs CORRETOS (verificados)
const cidades = [
  { nome: "João Pessoa", id: 3397277 },
  { nome: "Campina Grande", id: 3403642 },
  { nome: "Santa Rita", id: 3389321 },
  { nome: "Patos", id: 3392929 },
  { nome: "Guarabira", id: 3398570 },
  { nome: "Cabedelo", id: 3404558 },
  { nome: "Sousa", id: 3387202 }, // ID CORRIGIDO para Sousa-PB
  { nome: "Esperança", id: 3400752 },
  { nome: "Pombal", id: 3392191 },
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
  { nome: "Serra Branca", id: 3387880 },
  { nome: "Bayeux", id: 3405940 },
  { nome: "Rio Tinto", id: 3390160 },
  { nome: "Pedras de Fogo", id: 3392638 }
];

// Temperaturas realistas para a Paraíba (entre 15°C e 40°C)
function isValidTemp(temp) {
  return temp !== null && !isNaN(temp) && temp >= 10 && temp <= 45;
}

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

async function fetchClimaComFallback(cidade, index, total) {
  // Tentativa 1: Buscar por ID
  try {
    const urlById = `https://api.openweathermap.org/data/2.5/weather?id=${cidade.id}&appid=${API_KEY}&units=metric&lang=pt_br`;
    console.log(`🌤️ [${index + 1}/${total}] Buscando: ${cidade.nome} (ID: ${cidade.id})`);
    
    const response = await fetch(urlById);
    
    if (response.ok) {
      const data = await response.json();
      const temp = Math.round(data.main.temp);
      
      // Verificar se a cidade retornada é realmente a que queremos
      const cidadeRetornada = data.name;
      if (cidadeRetornada !== cidade.nome && !cidadeRetornada.includes(cidade.nome)) {
        console.log(`⚠️ Atenção: ${cidade.nome} retornou dados de ${cidadeRetornada}`);
      }
      
      // Validar temperatura realista
      if (!isValidTemp(temp)) {
        console.log(`⚠️ Temperatura inválida para ${cidade.nome}: ${temp}°C, tentando fallback...`);
        throw new Error('Temperatura inválida');
      }
      
      return {
        cidade: cidade.nome,
        temperatura: temp,
        condicao: data.weather[0].description,
        umidade: data.main.humidity,
        vento: Math.round(data.wind.speed * 3.6),
        icone: getIcon(data.weather[0].icon),
        sensacao: Math.round(data.main.feels_like),
        pressao: data.main.pressure,
        atualizado: getDataBrasilia()
      };
    }
  } catch (error) {
    console.log(`⚠️ ID falhou para ${cidade.nome}, tentando por nome...`);
  }
  
  // Tentativa 2: Buscar por nome com estado
  try {
    const urlByName = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade.nome)},Paraiba,Brazil&appid=${API_KEY}&units=metric&lang=pt_br`;
    console.log(`🔄 [${index + 1}/${total}] Buscando: ${cidade.nome} (por nome com estado)`);
    
    const response = await fetch(urlByName);
    
    if (response.ok) {
      const data = await response.json();
      const temp = Math.round(data.main.temp);
      
      if (!isValidTemp(temp)) {
        console.log(`⚠️ Temperatura inválida para ${cidade.nome}: ${temp}°C`);
      }
      
      return {
        cidade: cidade.nome,
        temperatura: isValidTemp(temp) ? temp : null,
        condicao: data.weather[0].description,
        umidade: data.main.humidity,
        vento: Math.round(data.wind.speed * 3.6),
        icone: getIcon(data.weather[0].icon),
        sensacao: Math.round(data.main.feels_like),
        pressao: data.main.pressure,
        atualizado: getDataBrasilia()
      };
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar ${cidade.nome} por nome:`, error.message);
  }
  
  // Tentativa 3: Buscar por nome sem estado (fallback final)
  try {
    const urlSimple = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade.nome)}&appid=${API_KEY}&units=metric&lang=pt_br`;
    console.log(`🔄 [${index + 1}/${total}] Buscando: ${cidade.nome} (nome simples)`);
    
    const response = await fetch(urlSimple);
    
    if (response.ok) {
      const data = await response.json();
      const temp = Math.round(data.main.temp);
      
      // Verificar se a cidade está na Paraíba (apenas validação de temperatura)
      if (isValidTemp(temp)) {
        return {
          cidade: cidade.nome,
          temperatura: temp,
          condicao: data.weather[0].description,
          umidade: data.main.humidity,
          vento: Math.round(data.wind.speed * 3.6),
          icone: getIcon(data.weather[0].icon),
          sensacao: Math.round(data.main.feels_like),
          pressao: data.main.pressure,
          atualizado: getDataBrasilia()
        };
      }
    }
  } catch (error) {
    console.error(`❌ Erro final em ${cidade.nome}`);
  }
  
  // Dados padrão se tudo falhar
  return {
    cidade: cidade.nome,
    temperatura: null,
    condicao: "Dados indisponíveis",
    umidade: null,
    vento: null,
    icone: '/icones/Nublado.png',
    sensacao: null,
    pressao: null,
    atualizado: getDataBrasilia()
  };
}

async function fetchAllClima() {
  const resultados = [];
  const total = cidades.length;
  
  console.log(`\n🚀 Buscando clima para ${total} cidades da Paraíba...`);
  console.log(`⏱️  Delay de ${DELAY_MS}ms entre requisições\n`);
  
  for (let i = 0; i < total; i++) {
    const resultado = await fetchClimaComFallback(cidades[i], i, total);
    resultados.push(resultado);
    
    if (i < total - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
  
  // Exibir resumo final
  console.log('\n📊 RESUMO FINAL:');
  const cidadesComErro = resultados.filter(r => r.temperatura === null);
  const cidadesOk = resultados.filter(r => r.temperatura !== null);
  console.log(`✅ ${cidadesOk.length} cidades OK`);
  if (cidadesComErro.length > 0) {
    console.log(`❌ ${cidadesComErro.length} cidades com erro:`, cidadesComErro.map(c => c.cidade).join(', '));
  }
  
  return resultados;
}

app.use(express.static('public'));

app.get('/clima', async (req, res) => {
  try {
    const cachePath = path.join(__dirname, 'public', 'clima.json');
    
    if (fs.existsSync(cachePath)) {
      const cacheData = fs.readFileSync(cachePath, 'utf8');
      console.log('📦 Retornando dados do cache');
      res.json(JSON.parse(cacheData));
      
      // Atualiza em background
      fetchAllClima().then(novosDados => {
        if (!fs.existsSync('public')) fs.mkdirSync('public');
        fs.writeFileSync(cachePath, JSON.stringify(novosDados, null, 2));
        console.log('✅ Cache atualizado em background');
      }).catch(error => {
        console.error('❌ Erro na atualização em background:', error);
      });
    } else {
      const dadosClima = await fetchAllClima();
      if (!fs.existsSync('public')) fs.mkdirSync('public');
      fs.writeFileSync(cachePath, JSON.stringify(dadosClima, null, 2));
      res.json(dadosClima);
    }
  } catch (error) {
    console.error('❌ Erro na rota /clima:', error);
    res.status(500).json({ error: 'Erro ao buscar dados', message: error.message });
  }
});

app.get('/clima.json', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'clima.json');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    total_cities: cidades.length,
    api_source: 'OpenWeatherMap'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Monitorando ${cidades.length} cidades da Paraíba`);
  console.log(`📍 Acesse: http://localhost:${PORT}\n`);
});

setInterval(async () => {
  try {
    console.log('\n🔄 Atualização programada...');
    const dadosClima = await fetchAllClima();
    const cachePath = path.join(__dirname, 'public', 'clima.json');
    fs.writeFileSync(cachePath, JSON.stringify(dadosClima, null, 2));
    console.log('✅ Cache atualizado');
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
  }
}, 30 * 60 * 1000);