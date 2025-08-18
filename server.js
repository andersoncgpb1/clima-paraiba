import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = "839f9d68e89a408f9f9d68e89a008fd7";

// Lista com 223 cidades + lat/lon
const cidadesPB = [
  { nome: "Água Branca", lat: -7.4547, lon: -37.5041 },
  { nome: "Aguiar", lat: -6.7886, lon: -37.6172 },
  { nome: "Alagoa Grande", lat: -7.1027, lon: -35.5538 },
  { nome: "Alagoa Nova", lat: -7.2396, lon: -35.5346 },
  { nome: "Alagoinha", lat: -7.0753, lon: -36.3801 },
  // ... inclua aqui todas as outras cidades
  { nome: "Zabelê", lat: -7.6167, lon: -36.6250 }
];

// Rota principal
app.get("/", (req, res) => {
  res.send("🌤️ API Clima Paraíba - acesse /clima para ver as temperaturas.");
});

// Rota para retornar temperaturas
app.get("/clima", async (req, res) => {
  try {
    const resultados = await Promise.all(
      cidadesPB.map(async (cidade) => {
        const url = `https://api.weather.com/v3/wx/conditions/current?geocode=${cidade.lat},${cidade.lon}&language=pt-BR&format=json&apiKey=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        return {
          cidade: cidade.nome,
          temperatura: data.temperature ?? "N/A"
        };
      })
    );

    res.json({ clima: resultados });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: error.message });
  }
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
