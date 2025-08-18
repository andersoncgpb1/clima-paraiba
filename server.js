// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Lista das principais cidades da Paraíba
const cidades = [
  "João Pessoa",
  "Campina Grande",
  "Santa Rita",
  "Bayeux",
  "Patos",
  "Guarabira",
  "Cabedelo",
  "Sousa",
  "Esperança",
  "Picuí",
  "Cajazeiras",
  "Bananeiras"
  
];

function traduzirCondicao(condicao) {
  const mapa = {
    "Sunny": "Ensolarado",
    "Clear": "Ensolarado",
    "Partly cloudy": "Nublado com Sol",
    "Cloudy": "Nublado",
    "Overcast": "Nublado",
    "Mist": "Nublado",
    "Patchy rain possible": "Chuva",
    "Patchy snow possible": "Neve",
    "Patchy sleet possible": "Neve",
    "Patchy freezing drizzle possible": "Chuva",
    "Thundery outbreaks possible": "Tempestade",
    "Blowing snow": "Neve",
    "Blizzard": "Neve",
    "Fog": "Nublado",
    "Freezing fog": "Nublado",
    "Patchy light drizzle": "Chuva",
    "Light drizzle": "Chuva",
    "Heavy drizzle": "Chuva",
    "Patchy light rain": "Chuva",
    "Light rain": "Chuva",
    "Moderate rain at times": "Chuva",
    "Moderate rain": "Chuva",
    "Heavy rain at times": "Chuva",
    "Heavy rain": "Chuva",
    "Light snow": "Neve",
    "Moderate snow": "Neve",
    "Heavy snow": "Neve",
    "Thunderstorm": "Tempestade",
    "Patchy light rain with thunder": "Tempestade com Sol",
    "Moderate or heavy rain with thunder": "Tempestade",
    // Adicione outras conforme necessidade
  };

  return mapa[condicao] || condicao; // se não encontrar, retorna original
}


// Endpoint para retornar dados em JSON (pode ser usado pelo vMix)
app.get("/clima", async (req, res) => {
  const resultados = [];

  for (let cidade of cidades) {
    try {
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=5d0ba8b53e344994ad424037251608&q=${encodeURIComponent(cidade)}&aqi=no`);
      const data = await response.json();

 const condicaoPt = traduzirCondicao(data.current.condition.text);

resultados.push({
  cidade: data.location.name,
  temperatura: Math.floor(data.current.temp_c), // apenas inteiro
  condicao: condicaoPt,
  icone: getIcon(condicaoPt)
});

    } catch (err) {
      resultados.push({
        cidade,
        erro: "Não foi possível obter dados",
        detalhes: err.message
      });
    }
  }

  res.json(resultados);
});

// Servir arquivos estáticos (index.html, css, etc.)
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
