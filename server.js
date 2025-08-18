import express from "express";
import https from "https";

const app = express();
const PORT = process.env.PORT || 3000;

// API key WeatherAPI
const API_KEY = "5d0ba8b53e344994ad424037251608";

// Principais cidades da Paraíba por população
const cidades = [
  "João Pessoa",
  "Campina Grande",
  "Santa Rita",
  "Patos",
  "Bayeux",
  "Cabedelo",
  "Guarabira",
  "Sousa",
  "Cajazeiras",
  "Sapé"
  "Guarabira"
  "Bananeiras"
  "Cajazeiras"
];

// Função para buscar clima
function buscarClima(cidade) {
  return new Promise((resolve, reject) => {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(cidade)}&aqi=no`;

    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", (err) => reject(err));
  });
}

// Mapear condição do tempo para ícones do GitHub
function mapIcon(condition) {
  const baseURL = "https://raw.githubusercontent.com/andersoncgpb1/clima-paraiba/d68cf29407da1a8caaf56b4ab2a387b863f01d3f/icones/Clima/";
  condition = condition.toLowerCase();

  if (condition.includes("sol") && condition.includes("chuva")) return baseURL + "Chuva com Sol.png";
  if (condition.includes("sol") && condition.includes("nublado")) return baseURL + "Nublado com Sol.png";
  if (condition.includes("nublado") && condition.includes("noite")) return baseURL + "Nublado Noite.png";
  if (condition.includes("nublado")) return baseURL + "Nublado.png";
  if (condition.includes("sol") || condition.includes("ensolarado")) return baseURL + "Ensolarado.png";
  if (condition.includes("chuva") && condition.includes("noite")) return baseURL + "Chuva Noite.png";
  if (condition.includes("chuva")) return baseURL + "Chuva.png";
  if (condition.includes("tempestade") && condition.includes("noite")) return baseURL + "Tempestade Noite.png";
  if (condition.includes("tempestade") && condition.includes("sol")) return baseURL + "Tempestade com sol.png";
  if (condition.includes("tempestade")) return baseURL + "Tempestade.png";

  return baseURL + "Ensolarado.png"; // ícone default
}

// Endpoint do vMix
app.get("/clima", async (req, res) => {
  try {
    const resultados = await Promise.all(
      cidades.map(async (cidade) => {
        const data = await buscarClima(cidade);
        return {
          cidade: cidade,
          temperatura: data.current.temp_c,
          condicao: data.current.condition.text,
          icone: mapIcon(data.current.condition.text),
        };
      })
    );
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
