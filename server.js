const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'f1d6e106487c211e360c92271b174c2c';
const GITHUB_ICONS_BASE = 'https://raw.githubusercontent.com/andersoncgpb1/clima-paraiba/main/icones/';

app.use(cors());
app.use(express.json());

// Cidades da Paraíba
const cidades = [
    { nome: "Água Branca", id: 2500106 },
    { nome: "Aguiar", id: 2500205 },
    { nome: "Alagoa Grande", id: 2500304 },
    { nome: "Alagoa Nova", id: 2500403 },
    { nome: "Alagoinha", id: 2500502 },
    { nome: "Alcantil", id: 2500536 },
    { nome: "Algodão de Jandaíra", id: 2500577 },
    { nome: "Alhandra", id: 2500601 },
    { nome: "Amparo", id: 2500734 },
    { nome: "Aparecida", id: 2500775 },
    { nome: "Araçagi", id: 2500809 },
    { nome: "Arara", id: 2500908 },
    { nome: "Araruna", id: 2501005 },
    { nome: "Areia", id: 2501104 },
    { nome: "Areia de Baraúnas", id: 2501153 },
    { nome: "Aroeiras", id: 2501203 },
    { nome: "Assunção", id: 2501302 },
    { nome: "Baía da Traição", id: 2501351 },
    { nome: "Bananeiras", id: 2501401 },
    { nome: "Baraúna", id: 2501500 },
    { nome: "Barra de Santa Rosa", id: 2501534 },
    { nome: "Barra de Santana", id: 2501575 },
    { nome: "Barra de São Miguel", id: 2501609 },
    { nome: "Bayeux", id: 2501708 },
    { nome: "Belém", id: 2501807 },
    { nome: "Belém do Brejo do Cruz", id: 2501906 },
    { nome: "Bernardino Batista", id: 2502003 },
    { nome: "Boa Ventura", id: 2502052 },
    { nome: "Boa Vista", id: 2502102 },
    { nome: "Bom Jesus", id: 2502201 },
    { nome: "Bom Sucesso", id: 2502300 },
    { nome: "Bonito de Santa Fé", id: 2502409 },
    { nome: "Boqueirão", id: 2502508 },
    { nome: "Borborema", id: 2502706 },
    { nome: "Brejo do Cruz", id: 2502805 },
    { nome: "Brejo dos Santos", id: 2502904 },
    { nome: "Caaporã", id: 2503001 },
    { nome: "Cabaceiras", id: 2503100 },
    { nome: "Cabedelo", id: 2503209 },
    { nome: "Cachoeira dos Índios", id: 2503308 },
    { nome: "Cacimba de Areia", id: 2503407 },
    { nome: "Cacimba de Dentro", id: 2503506 },
    { nome: "Cacimbas", id: 2503555 },
    { nome: "Caiçara", id: 2503605 },
    { nome: "Cajazeiras", id: 2503704 },
    { nome: "Cajazeirinhas", id: 2503753 },
    { nome: "Caldas Brandão", id: 2503803 },
    { nome: "Camalaú", id: 2503902 },
    { nome: "Campina Grande", id: 2504009 },
    { nome: "Capim", id: 2504033 },
    { nome: "Caraúbas", id: 2504074 },
    { nome: "Carrapateira", id: 2504108 },
    { nome: "Casserengue", id: 2504157 },
    { nome: "Catingueira", id: 2504207 },
    { nome: "Catolé do Rocha", id: 2504306 },
    { nome: "Caturité", id: 2504355 },
    { nome: "Conceição", id: 2504405 },
    { nome: "Condado", id: 2504504 },
    { nome: "Conde", id: 2504603 },
    { nome: "Congo", id: 2504702 },
    { nome: "Coremas", id: 2504801 },
    { nome: "Coxixola", id: 2504850 },
    { nome: "Cruz do Espírito Santo", id: 2504900 },
    { nome: "Cubati", id: 2505006 },
    { nome: "Cuité", id: 2505105 },
    { nome: "Cuité de Mamanguape", id: 2505238 },
    { nome: "Cuitegi", id: 2505204 },
    { nome: "Curral de Cima", id: 2505279 },
    { nome: "Curral Velho", id: 2505303 },
    { nome: "Damião", id: 2505352 },
    { nome: "Desterro", id: 2505402 },
    { nome: "Diamante", id: 2505600 },
    { nome: "Dona Inês", id: 2505709 },
    { nome: "Duas Estradas", id: 2505808 },
    { nome: "Emas", id: 2505907 },
    { nome: "Esperança", id: 2506004 },
    { nome: "Fagundes", id: 2506103 },
    { nome: "Frei Martinho", id: 2506202 },
    { nome: "Gado Bravo", id: 2506251 },
    { nome: "Guarabira", id: 2506301 },
    { nome: "Gurinhém", id: 2506400 },
    { nome: "Gurjão", id: 2506509 },
    { nome: "Ibiara", id: 2506608 },
    { nome: "Igaracy", id: 2502607 },
    { nome: "Imaculada", id: 2506707 },
    { nome: "Ingá", id: 2506806 },
    { nome: "Itabaiana", id: 2506905 },
    { nome: "Itaporanga", id: 2507002 },
    { nome: "Itapororoca", id: 2507101 },
    { nome: "Itatuba", id: 2507200 },
    { nome: "Jacaraú", id: 2507309 },
    { nome: "Jericó", id: 2507408 },
    { nome: "João Pessoa", id: 2507507 },
    { nome: "Juarez Távora", id: 2507606 },
    { nome: "Juazeirinho", id: 2507705 },
    { nome: "Junco do Seridó", id: 2507804 },
    { nome: "Juripiranga", id: 2507903 },
    { nome: "Juru", id: 2508000 },
    { nome: "Lagoa", id: 2508109 },
    { nome: "Lagoa de Dentro", id: 2508208 },
    { nome: "Lagoa Seca", id: 2508307 },
    { nome: "Lastro", id: 2508406 },
    { nome: "Livramento", id: 2508505 },
    { nome: "Logradouro", id: 2508554 },
    { nome: "Lucena", id: 2508604 },
    { nome: "Mãe d'Água", id: 2508703 },
    { nome: "Malta", id: 2508802 },
    { nome: "Mamanguape", id: 2508901 },
    { nome: "Manaíra", id: 2509008 },
    { nome: "Marcação", id: 2509057 },
    { nome: "Mari", id: 2509107 },
    { nome: "Marizópolis", id: 2509156 },
    { nome: "Massaranduba", id: 2509206 },
    { nome: "Mataraca", id: 2509305 },
    { nome: "Matinhas", id: 2509339 },
    { nome: "Mato Grosso", id: 2509370 },
    { nome: "Maturéia", id: 2509404 },
    { nome: "Mogeiro", id: 2509503 },
    { nome: "Montadas", id: 2509602 },
    { nome: "Monte Horebe", id: 2509701 },
    { nome: "Monteiro", id: 2509800 },
    { nome: "Mulungu", id: 2509909 },
    { nome: "Natuba", id: 2510006 },
    { nome: "Nazarezinho", id: 2510105 },
    { nome: "Nova Floresta", id: 2510204 },
    { nome: "Nova Olinda", id: 2510303 },
    { nome: "Nova Palmeira", id: 2510402 },
    { nome: "Olho D'Água", id: 2510501 },
    { nome: "Olivedos", id: 2510600 },
    { nome: "Ouro Velho", id: 2510659 },
    { nome: "Parari", id: 2510709 },
    { nome: "Passagem", id: 2510808 },
    { nome: "Patos", id: 2510907 },
    { nome: "Paulista", id: 2511004 },
    { nome: "Pedra Branca", id: 2511103 },
    { nome: "Pedra Lavrada", id: 2511202 },
    { nome: "Pedras de Fogo", id: 2511301 },
    { nome: "Piancó", id: 2511400 },
    { nome: "Picuí", id: 2511509 },
    { nome: "Pilar", id: 2511608 },
    { nome: "Pilões", id: 2511707 },
    { nome: "Pilõezinhos", id: 2511806 },
    { nome: "Pirpirituba", id: 2511905 },
    { nome: "Pitimbu", id: 2512002 },
    { nome: "Pocinhos", id: 2512101 },
    { nome: "Poço Dantas", id: 2512200 },
    { nome: "Poço de José de Moura", id: 2512309 },
    { nome: "Pombal", id: 2512408 },
    { nome: "Prata", id: 2512507 },
    { nome: "Princesa Isabel", id: 2512606 },
    { nome: "Puxinanã", id: 2512705 },
    { nome: "Queimadas", id: 2512721 },
    { nome: "Quixabá", id: 2512747 },
    { nome: "Remígio", id: 2512754 },
    { nome: "Pedro Régis", id: 2512762 },
    { nome: "Riachão", id: 2512788 },
    { nome: "Riachão do Bacamarte", id: 2512804 },
    { nome: "Riachão do Poço", id: 2512903 },
    { nome: "Riacho de Santo Antônio", id: 2513000 },
    { nome: "Riacho dos Cavalos", id: 2513109 },
    { nome: "Rio Tinto", id: 2513158 },
    { nome: "Salgadinho", id: 2513208 },
    { nome: "Salgado de São Félix", id: 2513307 },
    { nome: "Santa Cecília", id: 2513356 },
    { nome: "Santa Cruz", id: 2513406 },
    { nome: "Santa Helena", id: 2513505 },
    { nome: "Santa Inês", id: 2513604 },
    { nome: "Santa Luzia", id: 2513703 },
    { nome: "Santa Rita", id: 2513802 },
    { nome: "Santa Teresinha", id: 2513851 },
    { nome: "Santana de Mangueira", id: 2513901 },
    { nome: "Santana dos Garrotes", id: 2513927 },
    { nome: "Santarém", id: 2513943 },
    { nome: "Santo André", id: 2513968 },
    { nome: "São Bentinho", id: 2514008 },
    { nome: "São Bento", id: 2514107 },
    { nome: "São Domingos do Cariri", id: 2514206 },
    { nome: "São Domingos", id: 2514305 },
    { nome: "São Francisco", id: 2514404 },
    { nome: "São João do Cariri", id: 2514503 },
    { nome: "São João do Rio do Peixe", id: 2514552 },
    { nome: "São João do Tigre", id: 2514602 },
    { nome: "São José da Lagoa Tapada", id: 2514651 },
    { nome: "São José de Caiana", id: 2514701 },
    { nome: "São José de Espinharas", id: 2514800 },
    { nome: "São José de Piranhas", id: 2514909 },
    { nome: "São José de Princesa", id: 2515005 },
    { nome: "São José do Bonfim", id: 2515104 },
    { nome: "São José do Brejo do Cruz", id: 2515203 },
    { nome: "São José do Sabugi", id: 2515302 },
    { nome: "São José dos Cordeiros", id: 2515401 },
    { nome: "São José dos Ramos", id: 2515500 },
    { nome: "São Mamede", id: 2515609 },
    { nome: "São Miguel de Taipu", id: 2515708 },
    { nome: "São Sebastião de Lagoa de Roça", id: 2515807 },
    { nome: "São Sebastião do Umbuzeiro", id: 2515906 },
    { nome: "Sapé", id: 2515930 },
    { nome: "São Vicente do Seridó", id: 2515971 },
    { nome: "Serra Branca", id: 2516003 },
    { nome: "Serra da Raiz", id: 2516102 },
    { nome: "Serra Grande", id: 2516151 },
    { nome: "Serra Redonda", id: 2516201 },
    { nome: "Serraria", id: 2516300 },
    { nome: "Sertãozinho", id: 2516409 },
    { nome: "Sobrado", id: 2516508 },
    { nome: "Solânea", id: 2516607 },
    { nome: "Soledade", id: 2516706 },
    { nome: "Sossêgo", id: 2516755 },
    { nome: "Sousa", id: 2516805 },
    { nome: "Sumé", id: 2516904 },
    { nome: "Tacima", id: 2517001 },
    { nome: "Taperoá", id: 2517100 },
    { nome: "Tavares", id: 2517209 },
    { nome: "Teixeira", id: 2517308 },
    { nome: "Tenório", id: 2517407 },
    { nome: "Triunfo", id: 2517506 },
    { nome: "Uiraúna", id: 2517605 },
    { nome: "Umbuzeiro", id: 2517704 },
    { nome: "Várzea", id: 2517803 },
    { nome: "Vieirópolis", id: 2517902 },
    { nome: "Vista Serrana", id: 2518009 },
    { nome: "Zabelê", id: 2518108 }
];

// Mapeamento de ícones → GitHub
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

function getMoonPhase() {
    const day = new Date().getDate();
    const phases = Object.keys(moonPhaseIcons);
    return phases[day % phases.length];
}

function getGitHubIcon(iconCode, isNight = false) {
    let iconFile = iconMap[iconCode] || iconMap['default'];
    if (isNight && iconCode.includes('d')) {
        const nightCode = iconCode.replace('d', 'n');
        iconFile = iconMap[nightCode] || iconFile;
    }
    return GITHUB_ICONS_BASE + iconFile;
}

async function fetchClima(cidade) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?id=${cidade.id}&appid=${API_KEY}&units=metric&lang=pt`
        );
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        let temp = Math.round(data.main.temp);
        if (temp === 0) temp = null; // Corrige temperatura zerada
        const iconeCode = data.weather[0].icon;
        const isNight = iconeCode.includes('n');
        return {
            cidade: cidade.nome,
            temperatura: temp,
            condicao: data.weather[0].description,
            umidade: data.main.humidity,
            vento: Math.round(data.wind.speed * 3.6),
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

async function atualizarClima() {
    const dadosClima = await Promise.all(cidades.map(fetchClima));
    if (!fs.existsSync('public')) fs.mkdirSync('public');
    fs.writeFileSync(path.join(__dirname, 'public', 'clima.json'), JSON.stringify(dadosClima, null, 2));
    console.log(`[${getDataBrasilia()}] Clima atualizado`);
}

app.get('/clima', async (req, res) => {
    await atualizarClima();
    res.sendFile(path.join(__dirname, 'public', 'clima.json'));
});

app.use(express.static('public'));
app.get('/health', (req, res) => res.json({ status: 'online', timestamp: getDataBrasilia() }));

// Atualiza automaticamente a cada 15 minutos
setInterval(atualizarClima, 15 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
