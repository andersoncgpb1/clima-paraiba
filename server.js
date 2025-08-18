import express from "express";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

// Lista completa das 223 cidades da Paraíba (exemplo parcial, você adiciona todas)
const cidadesPB = [
  "Água Branca", "Aguiar", "Alagoa Grande", "Alagoa Nova", "Alagoinha",
  "Alcantil", "Algodão de Jandaíra", "Alhandra", "Amparo", "Aparecida",
  "Araçagi", "Arara", "Araruna", "Areia", "Areia de Baraúnas",
  "Areial", "Aroeiras", "Assunção", "Baía da Traição", "Bananeiras",
  "Baraúna", "Barra de Santa Rosa", "Barra de Santana", "Barra de São Miguel",
  "Bayeux", "Belém", "Belém do Brejo do Cruz", "Bernardino Batista", "Boa Ventura",
  "Boa Vista", "Bom Jesus", "Bom Sucesso", "Bonito de Santa Fé", "Boqueirão",
  "Borborema", "Brejo do Cruz", "Brejo dos Santos", "Caaporã", "Cabaceiras",
  "Cabedelo", "Cachoeira dos Índios", "Cacimba de Areia", "Cacimba de Dentro",
  "Cacimbas", "Caiçara", "Cajazeiras", "Cajazeirinhas", "Caldas Brandão",
  "Camalaú", "Campina Grande", "Capim", "Caraúbas", "Carrapateira",
  "Casserengue", "Catingueira", "Catolé do Rocha", "Caturité", "Conceição",
  "Condado", "Conde", "Congo", "Coremas", "Coxixola",
  "Cruz do Espírito Santo", "Cubati", "Cuité", "Cuité de Mamanguape", "Cuitegi",
  "Curral de Cima", "Curral Velho", "Damião", "Desterro", "Diamante",
  "Dona Inês", "Duas Estradas", "Emas", "Esperança", "Fagundes",
  "Frei Martinho", "Gado Bravo", "Guarabira", "Gurinhém", "Gurjão",
  "Ibiara", "Igaracy", "Imaculada", "Ingá", "Itabaiana",
  "Itaporanga", "Itapororoca", "Itatuba", "Jacaraú", "Jericó",
  "João Pessoa", "Juarez Távora", "Juazeirinho", "Junco do Seridó", "Juripiranga",
  "Juru", "Lagoa", "Lagoa de Dentro", "Lagoa Seca", "Lastro",
  "Livramento", "Logradouro", "Lucena", "Mãe d'Água", "Malta",
  "Mamanguape", "Manaíra", "Marcação", "Mari", "Marizópolis",
  "Massaranduba", "Mataraca", "Matinhas", "Mato Grosso", "Maturéia",
  "Mogeiro", "Montadas", "Monte Horebe", "Monteiro", "Mulungu",
  "Natuba", "Nazarezinho", "Nova Floresta", "Nova Olinda", "Nova Palmeira",
  "Olho d'Água", "Olivedos", "Ouro Velho", "Parari", "Passagem",
  "Patos", "Paulista", "Pedra Branca", "Pedra Lavrada", "Pedras de Fogo",
  "Pedro Régis", "Piancó", "Picuí", "Pilar", "Pilões",
  "Pilõezinhos", "Pirpirituba", "Pitimbu", "Pocinhos", "Poço Dantas",
  "Poço de José de Moura", "Pombal", "Prata", "Princesa Isabel", "Puxinanã",
  "Queimadas", "Quixabá", "Remígio", "Riachão", "Riachão do Bacamarte",
  "Riachão do Poço", "Riacho de Santo Antônio", "Riacho dos Cavalos", "Rio Tinto", "Salgadinho",
  "Salgado de São Félix", "Santa Cecília", "Santa Cruz", "Santa Helena", "Santa Inês",
  "Santa Luzia", "Santa Rita", "Santa Teresinha", "Santana de Mangueira", "Santana dos Garrotes",
  "Santo André", "São Bentinho", "São Bento", "São Domingos", "São Domingos do Cariri",
  "São Francisco", "São João do Cariri", "São João do Rio do Peixe", "São João do Tigre", "São José da Lagoa Tapada",
  "São José de Caiana", "São José de Espinharas", "São José de Piranhas", "São José de Princesa", "São José do Bonfim",
  "São José do Brejo do Cruz", "São José do Sabugi", "São José dos Cordeiros", "São José dos Ramos", "São Mamede",
  "São Miguel de Taipu", "São Sebastião de Lagoa de Roça", "São Sebastião do Umbuzeiro", "Sapé", "Seridó",
  "Serra Branca", "Serra da Raiz", "Serra Grande", "Serra Redonda", "Serraria",
  "Sertãozinho", "Sobrado", "Solânea", "Soledade", "Sossêgo",
  "Sousa", "Sumé", "Taperoá", "Tavares", "Teixeira",
  "Tenório", "Triunfo", "Uiraúna", "Umbuzeiro", "Várzea",
  "Vieirópolis", "Vista Serrana", "Zabelê"
];

// Função para buscar temperatura no MSN Clima
async function getClima(cidade) {
  try {
    const url = `https://www.msn.com/pt-br/clima/forecast/${encodeURIComponent(cidade)}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Seletor atualizado para temperatura
    const tempText = $(".current-temp").first().text() || "N/A";
    const temperatura = tempText.replace("°", "").trim();
    return {
      cidade: cidade,
      temperatura: temperatura ? Math.round(Number(temperatura)) : "N/A"
    };
  } catch (err) {
    return {
      cidade: cidade,
      temperatura: "N/A"
    };
  }
}

// Rota principal
app.get("/", (req, res) => {
  res.send("🌤️ API Clima Paraíba - acesse /clima para ver os dados em tempo real.");
});

// Rota /clima
app.get("/clima", async (req, res) => {
  try {
    const resultados = await Promise.all(cidadesPB.map(getClima));
    res.json({ clima: resultados });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dados do MSN Clima", detalhes: err.message });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
