import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Configuração do __dirname no ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// lista de cidades da Paraíba (coloquei só 3 como exemplo, depois trocamos pelas 223)
const cidades = [
  { nome: "João Pessoa" },
  { nome: "Campina Grande" },
  { nome: "Patos" }
];

// rota da API WeatherAPI
const API_KEY = "5d0ba8b53e344994ad424037251608";

// rota estática para o dashboard
app.use(express.static(path.join(__dirname, "public")));

// rota que retorna o clima de todas as cidades
app.get("/clima", async (req, res) => {
  try {
    const resultados = [];

    for (const cidade of cidades) {
      const response = await fetch(
        `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
          cidade.nome
        )}&aqi=no`
      );

      const data = await response.json();

      if (data.error) {
        resultados.push({
          nome: cidade.nome,
          erro: data.error.message
        });
      } else {
        resultados.push({
          nome: data.location.name,
          temperatura: data.current.temp_c,
          condicao: data.current.condition.text,
          icone: data.current.condition.icon
        });
      }
    }

    res.json(resultados);
  } catch (error) {
    console.error("Erro ao buscar dados da API:", error);
    res.status(500).json({
      erro: "Erro ao buscar dados da API",
      detalhes: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
