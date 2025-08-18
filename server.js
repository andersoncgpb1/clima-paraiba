import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "5d0ba8b53e344994ad424037251608";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

// lista de cidades
const cidades = [
  "Campina Grande",
  "João Pessoa",
  "Patos",
  "Sousa",
  "Cajazeiras",
  "Guarabira",
  "Monteiro",
  "Catolé do Rocha",
  "Esperança",
  "Mamanguape"
];

app.get("/clima", async (req, res) => {
  let resultado = { cidades: [] };

  for (let cidade of cidades) {
    try {
      const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(cidade)}&aqi=no`;
      const response = await fetch(url);
      const data = await response.json();

      resultado.cidades.push({
        nome: cidade,
        temperatura: data.current.temp_c,
        condicao: data.current.condition.text,
        ultima_atualizacao: data.location.localtime
      });

    } catch (e) {
      resultado.cidades.push({
        nome: cidade,
        erro: "Não foi possível buscar a temperatura"
      });
    }
  }

  res.json(resultado);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
