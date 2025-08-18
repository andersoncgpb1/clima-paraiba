import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 10000;

// Lista das 223 cidades da Paraíba
const cidadesPB = [
  { nome: "Água Branca", id: 1 },
  { nome: "Aguiar", id: 2 },
  { nome: "Alagoa Grande", id: 3 },
  { nome: "Alagoa Nova", id: 4 },
  { nome: "Alagoinha", id: 5 }
  // ... completar todas as 223 cidades
];

// Função para buscar temperatura da cidade no MSN Clima
async function getClima(cidade) {
  try {
    // Crie a URL para pesquisa de cidade
    const url = `https://www.msn.com/pt-br/clima/forecast/${encodeURIComponent(cidade.nome)}`;
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Seletor CSS atualizado para temperatura
    const tempText = $(".current-temp").first().text() || "N/A";
    const temperatura = tempText.replace("°", "").trim();
    return {
      cidade: cidade.nome,
      temperatura: temperatura ? Math.round(Number(temperatura)) : "N/A"
    };
  } catch (err) {
    return {
      cidade: cidade.nome,
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
