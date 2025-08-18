import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Caminho para a pasta atual e public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, "public");

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(publicPath));

// Rota para buscar clima de uma cidade via WeatherAPI
app.get("/weather/:city", async (req, res) => {
  const city = req.params.city;
  const apiKey = process.env.WEATHERAPI_KEY || "5d0ba8b53e344994ad424037251608";

  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
        city
      )}&aqi=no`
    );

    if (!response.ok) {
      return res.status(response.status).json({
        erro: "Erro ao buscar dados da API",
        detalhes: `Status code ${response.status}`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: "Erro ao buscar dados da API",
      detalhes: err.message,
    });
  }
});

// Rota padrão para servir o index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
