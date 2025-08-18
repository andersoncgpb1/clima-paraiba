import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// sua chave da WeatherAPI
const API_KEY = "5d0ba8b53e344994ad424037251608";

// lista de cidades da Paraíba
const cidades = [
  "Campina Grande",
  "João Pessoa",
  "Patos",
  "Sousa",
  "Cajazeiras",
  "Guarabira",
  "Monteiro",
  "Itabaiana",
  "Catolé do Rocha",
  "Pombal"
];

// rota principal
app.get("/", (req, res) => {
  res.send("🌤️ API Clima Paraíba - acesse /clima para ver os dados em tempo real.");
});

// rota para buscar temperatura de todas as cidades
app.get("/clima", async (req, res) => {
  try {
    const resultados = await Promise.all(
      cidades.map(async (cidade) => {
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(
            cidade
          )}&aqi=no`
        );
        const data = await response.json();
        return {
          cidade: cidade,
          temperatura: data.current?.temp_c ?? "N/A",
          condicao: data.current?.condition?.text ?? "N/A",
          hora_local: data.location?.localtime ?? "N/A"
        };
      })
    );

    res.json({ clima: resultados });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: error.message });
  }
});

// inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
