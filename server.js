import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Caminho absoluto para a pasta public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

// Sua chave da WeatherAPI
const API_KEY = "5d0ba8b53e344994ad424037251608";

// Lista das principais cidades da Paraíba
const cities = [
  "João Pessoa",
  "Campina Grande",
  "Patos",
  "Santa Rita",
  "Bayeux",
  "Sousa"
];

// Mapeamento das condições para os ícones
function getIcon(condition) {
  const cond = condition.toLowerCase();
  if (cond.includes("chuva") && cond.includes("sol")) return "icones/Clima/Chuva com Sol.png";
  if (cond.includes("chuva")) return "icones/Clima/Chuva.png";
  if (cond.includes("tempestade") && cond.includes("sol")) return "icones/Clima/Tempestade com sol.png";
  if (cond.includes("tempestade")) return "icones/Clima/Tempestade.png";
  if (cond.includes("nublado") && cond.includes("sol")) return "icones/Clima/Nublado com Sol.png";
  if (cond.includes("nublado") && cond.includes("noite")) return "icones/Clima/Nublado Noite.png";
  if (cond.includes("nublado")) return "icones/Clima/Nublado.png";
  if (cond.includes("ensolarado")) return "icones/Clima/Ensolarado.png";
  return "icones/Clima/Ensolarado.png"; // default
}

// Endpoint para gerar JSON para o vMix
app.get("/clima", async (req, res) => {
  try {
    const results = [];

    for (const city of cities) {
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`);
      const data = await response.json();

      results.push({
        city: data.location.name,
        temp_c: data.current.temp_c,
        condition: data.current.condition.text,
        icon: getIcon(data.current.condition.text)
      });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
