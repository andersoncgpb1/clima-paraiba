// server.js
// API de clima para 223 cidades da Paraíba usando OpenWeatherMap (city IDs + /group)
// - Node 18+ (fetch nativo), sem dependências externas
// - Pronto para Render

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Use variável de ambiente se existir; senão, usa a sua chave conhecida
const API_KEY = process.env.OWM_KEY || "b4287a5c1971d7dc0de18a7304721da7";

// === Lista completa: 223 municípios da Paraíba com City ID do OpenWeatherMap ===
const cidadesPB = [
    {nome: "Água Branca", id: 3407961},
    {nome: "Aguiar", id: 3407965},
    {nome: "Alagoa Grande", id: 3408096},
    {nome: "Alagoa Nova", id: 3408097},
    {nome: "Alagoinha", id: 3408103},
    {nome: "Alcantil", id: 3408121},
    {nome: "Algodão de Jandaíra", id: 3408138},
    {nome: "Alhandra", id: 3408166},
    {nome: "Amparo", id: 3407616},
    {nome: "Aparecida", id: 3407385},
    {nome: "Araçagi", id: 3407360},
    {nome: "Arara", id: 3407346},
    {nome: "Araruna", id: 3407344},
    {nome: "Areia", id: 3407216},
    {nome: "Areia de Baraúnas", id: 3407214},
    {nome: "Areial", id: 3407212},
    {nome: "Aroeiras", id: 3407069},
    {nome: "Assunção", id: 3407028},
    {nome: "Baía da Traição", id: 3406924},
    {nome: "Bananeiras", id: 3406496},
    {nome: "Baraúna", id: 3406441},
    {nome: "Barra de Santa Rosa", id: 3406409},
    {nome: "Barra de Santana", id: 3406408},
    {nome: "Barra de São Miguel", id: 3406407},
    {nome: "Bayeux", id: 3407982},
    {nome: "Belém", id: 3405930},
    {nome: "Belém do Brejo do Cruz", id: 3405929},
    {nome: "Bernardino Batista", id: 3405914},
    {nome: "Boa Ventura", id: 3405747},
    {nome: "Boa Vista", id: 3405733},
    {nome: "Bom Jesus", id: 3405661},
    {nome: "Bom Sucesso", id: 3405641},
    {nome: "Bonito de Santa Fé", id: 3405631},
    {nome: "Boqueirão", id: 3405608},
    {nome: "Borborema", id: 3405585},
    {nome: "Brejo do Cruz", id: 3405456},
    {nome: "Brejo dos Santos", id: 3405455},
    {nome: "Caaporã", id: 3404594},
    {nome: "Cabaceiras", id: 3404578},
    {nome: "Cabedelo", id: 3404558},
    {nome: "Cachoeira dos Índios", id: 3404508},
    {nome: "Cacimba de Areia", id: 3404497},
    {nome: "Cacimba de Dentro", id: 3404496},
    {nome: "Cacimbas", id: 3404495},
    {nome: "Caiçara", id: 3404414},
    {nome: "Cajazeiras", id: 3404115},
    {nome: "Cajazeirinhas", id: 3404114},
    {nome: "Caldas Brandão", id: 3403923},
    {nome: "Camalaú", id: 3403878},
    {nome: "Campina Grande", id: 3403642},
    {nome: "Capim", id: 3403254},
    {nome: "Caraúbas", id: 3403150},
    {nome: "Carrapateira", id: 3403099},
    {nome: "Casserengue", id: 3402684},
    {nome: "Catingueira", id: 3402663},
    {nome: "Catolé do Rocha", id: 3402381},
    {nome: "Caturité", id: 3402369},
    {nome: "Conceição", id: 3401843},
    {nome: "Condado", id: 3401831},
    {nome: "Conde", id: 3401828},
    {nome: "Congo", id: 3401813},
    {nome: "Coremas", id: 3401734},
    {nome: "Coxixola", id: 3401562},
    {nome: "Cruz do Espírito Santo", id: 3401439},
    {nome: "Cubati", id: 3401406},
    {nome: "Cuité", id: 3401384},
    {nome: "Cuité de Mamanguape", id: 3401383},
    {nome: "Cuitegi", id: 3401382},
    {nome: "Curral de Cima", id: 3401353},
    {nome: "Curral Velho", id: 3401352},
    {nome: "Damião", id: 3401267},
    {nome: "Desterro", id: 3401093},
    {nome: "Diamante", id: 3401075},
    {nome: "Dona Inês", id: 3400933},
    {nome: "Duas Estradas", id: 3400907},
    {nome: "Emas", id: 3400775},
    {nome: "Esperança", id: 3400736},
    {nome: "Fagundes", id: 3400569},
    {nome: "Frei Martinho", id: 3400308},
    {nome: "Gado Bravo", id: 3399769},
    {nome: "Guarabira", id: 3398570},
    {nome: "Gurinhém", id: 3398459},
    {nome: "Gurjão", id: 3398458},
    {nome: "Ibiara", id: 3398379},
    {nome: "Igaracy", id: 3398309},
    {nome: "Imaculada", id: 3398268},
    {nome: "Ingá", id: 3398240},
    {nome: "Itabaiana", id: 3398076},
    {nome: "Itaporanga", id: 3397939},
    {nome: "Itapororoca", id: 3397938},
    {nome: "Itatuba", id: 3397891},
    {nome: "Jacaraú", id: 3397780},
    {nome: "Jericó", id: 3397541},
    {nome: "João Pessoa", id: 3397277},
    {nome: "Juarez Távora", id: 3397154},
    {nome: "Juazeirinho", id: 3397153},
    {nome: "Junco do Seridó", id: 3397138},
    {nome: "Juripiranga", id: 3397127},
    {nome: "Juru", id: 3397124},
    {nome: "Lagoa", id: 3396960},
    {nome: "Lagoa de Dentro", id: 3396946},
    {nome: "Lagoa Seca", id: 3396929},
    {nome: "Lastro", id: 3396636},
    {nome: "Livramento", id: 3396368},
    {nome: "Logradouro", id: 3396332},
    {nome: "Lucena", id: 3396283},
    {nome: "Mãe d'Água", id: 3395981},
    {nome: "Malta", id: 3395875},
    {nome: "Mamanguape", id: 3395713},
    {nome: "Manaíra", id: 3395696},
    {nome: "Marcação", id: 3395525},
    {nome: "Mari", id: 3395478},
    {nome: "Marizópolis", id: 3395469},
    {nome: "Massaranduba", id: 3395338},
    {nome: "Mataraca", id: 3395316},
    {nome: "Matinhas", id: 3395300},
    {nome: "Mato Grosso", id: 3395297},
    {nome: "Maturéia", id: 3395283},
    {nome: "Mogeiro", id: 3394617},
    {nome: "Montadas", id: 3394562},
    {nome: "Monte Horebe", id: 3394549},
    {nome: "Monteiro", id: 3394548},
    {nome: "Mulungu", id: 3394405},
    {nome: "Natuba", id: 3394024},
    {nome: "Nazarezinho", id: 3394013},
    {nome: "Nova Floresta", id: 3393832},
    {nome: "Nova Olinda", id: 3393809},
    {nome: "Nova Palmeira", id: 3393806},
    {nome: "Olho d'Água", id: 3393624},
    {nome: "Olivedos", id: 3393617},
    {nome: "Ouro Velho", id: 3393437},
    {nome: "Parari", id: 3393028},
    {nome: "Passagem", id: 3392958},
    {nome: "Patos", id: 3392929},
    {nome: "Paulista", id: 3392854},
    {nome: "Pedra Branca", id: 3392649},
    {nome: "Pedra Lavrada", id: 3392643},
    {nome: "Pedras de Fogo", id: 3392638},
    {nome: "Pedro Régis", id: 3392630},
    {nome: "Piancó", id: 3392424},
    {nome: "Picuí", id: 3392401},
    {nome: "Pilar", id: 3392379},
    {nome: "Pilões", id: 3392375},
    {nome: "Pilõezinhos", id: 3392374},
    {nome: "Pirpirituba", id: 3392296},
    {nome: "Pitimbu", id: 3392268},
    {nome: "Pocinhos", id: 3392242},
    {nome: "Poço Dantas", id: 3392239},
    {nome: "Poço de José de Moura", id: 3392238},
    {nome: "Pombal", id: 3392191},
    {nome: "Prata", id: 3392056},
    {nome: "Princesa Isabel", id: 3392049},
    {nome: "Puxinanã", id: 3391861},
    {nome: "Queimadas", id: 3391791},
    {nome: "Quixabá", id: 3391758},
    {nome: "Remígio", id: 3390770},
    {nome: "Riachão", id: 3390678},
    {nome: "Riachão do Bacamarte", id: 3390677},
    {nome: "Riachão do Poço", id: 3390676},
    {nome: "Riacho de Santo Antônio", id: 3390662},
    {nome: "Riacho dos Cavalos", id: 3390661},
    {nome: "Rio Tinto", id: 3390160},
    {nome: "Salgadinho", id: 3389779},
    {nome: "Salgado de São Félix", id: 3389778},
    {nome: "Santa Cecília", id: 3389557},
    {nome: "Santa Cruz", id: 3389542},
    {nome: "Santa Helena", id: 3389506},
    {nome: "Santa Inês", id: 3389493},
    {nome: "Santa Luzia", id: 3389461},
    {nome: "Santa Rita", id: 3389321},
    {nome: "Santa Teresinha", id: 3389312},
    {nome: "Santana de Mangueira", id: 3389356},
    {nome: "Santana dos Garrotes", id: 3389355},
    {nome: "Santo André", id: 3389292},
    {nome: "São Bentinho", id: 3388992},
    {nome: "São Bento", id: 3388991},
    {nome: "São Domingos", id: 3388932},
    {nome: "São Domingos do Cariri", id: 3388931},
    {nome: "São Francisco", id: 3388874},
    {nome: "São João do Cariri", id: 3388762},
    {nome: "São João do Rio do Peixe", id: 3388760},
    {nome: "São João do Tigre", id: 3388759},
    {nome: "São José da Lagoa Tapada", id: 3388687},
    {nome: "São José de Caiana", id: 3388685},
    {nome: "São José de Espinharas", id: 3388684},
    {nome: "São José de Piranhas", id: 3388683},
    {nome: "São José de Princesa", id: 3388682},
    {nome: "São José do Bonfim", id: 3388680},
    {nome: "São José do Brejo do Cruz", id: 3388679},
    {nome: "São José do Sabugi", id: 3388678},
    {nome: "São José dos Cordeiros", id: 3388677},
    {nome: "São José dos Ramos", id: 3388676},
    {nome: "São Mamede", id: 3388665},
    {nome: "São Miguel de Taipu", id: 3388645},
    {nome: "São Sebastião de Lagoa de Roça", id: 3388618},
    {nome: "São Sebastião do Umbuzeiro", id: 3388617},
    {nome: "Sapé", id: 3388582},
    {nome: "Seridó", id: 3387858},
    {nome: "Serra Branca", id: 3387841},
    {nome: "Serra da Raiz", id: 3387838},
    {nome: "Serra Grande", id: 3387833},
    {nome: "Serra Redonda", id: 3387828},
    {nome: "Serraria", id: 3387825},
    {nome: "Sertãozinho", id: 3387816},
    {nome: "Sobrado", id: 3387647},
    {nome: "Solânea", id: 3387607},
    {nome: "Soledade", id: 3387606},
    {nome: "Sossêgo", id: 3387598},
    {nome: "Sousa", id: 3387246},
    {nome: "Sumé", id: 3387147},
    {nome: "Taperoá", id: 3386687},
    {nome: "Tavares", id: 3386662},
    {nome: "Teixeira", id: 3386637},
    {nome: "Tenório", id: 3386623},
    {nome: "Triunfo", id: 3386016},
    {nome: "Uiraúna", id: 3385860},
    {nome: "Umbuzeiro", id: 3385852},
    {nome: "Várzea", id: 3385356},
    {nome: "Vieirópolis", id: 3385076},
    {nome: "Vista Serrana", id: 3385029},
    {nome: "Zabelê", id: 3384964}
];

// Util: divide array em pedaços (OWM group aceita máx. 20 IDs por chamada)
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

app.get("/", (_req, res) => {
  res.send("🌤️ API Clima Paraíba — use /clima para listar {cidade, temperatura} das 223 cidades (fonte: OpenWeatherMap).");
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/clima", async (_req, res) => {
  try {
    // Mapa id->nome para montar saída
    const idToName = new Map(cidadesPB.map(c => [String(c.id), c.nome]));
    const ids = cidadesPB.map(c => c.id);
    const batches = chunk(ids, 20);

    const resultados = [];

    for (const lote of batches) {
      const url = `https://api.openweathermap.org/data/2.5/group?id=${lote.join(",")}&units=metric&lang=pt_br&appid=${API_KEY}`;
      const resp = await fetch(url);
      // Trate respostas não-200
      if (!resp.ok) {
        // Mesmo se falhar um lote, seguimos com os demais
        resultados.push(...lote.map(id => ({
          cidade: idToName.get(String(id)) || String(id),
          temperatura: "N/A"
        })));
        continue;
      }
      const data = await resp.json();
      // data.list é um array com as cidades encontradas neste lote
      const encontrados = new Set();
      if (Array.isArray(data.list)) {
        for (const item of data.list) {
          const idStr = String(item.id);
          encontrados.add(idStr);
          resultados.push({
            cidade: idToName.get(idStr) || item.name || idStr,
            temperatura: (item.main && typeof item.main.temp === "number") ? item.main.temp : "N/A"
          });
        }
      }
      // Para IDs do lote que não voltaram (não encontrados), marca N/A
      for (const id of lote) {
        const idStr = String(id);
        if (!encontrados.has(idStr)) {
          resultados.push({
            cidade: idToName.get(idStr) || idStr,
            temperatura: "N/A"
          });
        }
      }
    }

    // Ordena alfabeticamente por cidade para saída estável
    resultados.sort((a, b) => a.cidade.localeCompare(b.cidade, "pt-BR"));

    res.json({ clima: resultados });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao buscar dados da API OpenWeatherMap",
      detalhes: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
