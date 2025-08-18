// server.js
import express from "express";
import fetch from "node-fetch"; // Render suporta node-fetch se instalado
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

// Principais cidades da Paraíba
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

// Função para traduzir condição do inglês para português
function traduzirCondicao(condicao) {
  condicao = condicao.toLowerCase();
  if (condicao.includes("sun")) return "Ensolarado";
  if (condicao.includes("cloud") && condicao.includes("night")) return "Nublado Noite";
  if (condicao.includes("cloud") && condicao.includes("sun")) return "Nublado com Sol";
  if (condicao.includes("cloud")) return "Nublado";
  if (condicao.includes("rain") && condicao.includes("sun")) return "Chuva com Sol";
  if (condicao.includes("rain")) return "Chuva";
  if (condicao.includes("storm") && condicao.includes("sun")) return "Tempestade com sol";
  if (condicao.includes("storm")) return "Tempestade";
  return "Ensolarado";
}

// Função para retornar o ícone correspondente
function getIcon(condition) {
  const iconesBase = "https://raw.githubusercontent.com/andersoncgpb1/clima-paraiba/main/icones/Clima/";
  condition = condition.toLowerCase();

  if (condition.includes("chuva") && condition.includes("sol")) return iconesBase + "Chuva com Sol.png";
  if (condition.includes("chuva")) return iconesBase + "Chuva.png";
  if (condition.includes("tempestade") && condition.includes("sol")) return iconesBase + "Tempestade com sol.png";
  if (condition.includes("tempestade")) return iconesBase + "Tempestade.png";
  if (condition.includes("ensolarado")) return iconesBase + "Ensolarado.png";
  if (condition.includes("nublado") && condition.includes("sol")) return iconesBase + "Nublado com Sol.png";
  if (condition.includes("nublado") && condition.includes("noite")) return iconesBase + "Nublado Noite.png";
  if (condition.includes("nublado")) return iconesBase + "Nublado.png";

  return iconesBase + "Ensolarado.png";
}

// Rota principal de clima
app.get("/clima", async (req, res) => {
  try {
    const resultados = [];

    for (const cidade of cidades) {
      const url = `http://api.weatherapi.com/v1/current.json?key=5d0ba8b53e344994ad424037251608&q=${encodeURIComponent(cidade)}&aqi=no`;
      const response = await fetch(url);
      const data = await response.json();

      const condicaoPt = traduzirCondicao(data.current.condition.text);

      resultados.push({
        cidade: data.location.name,
        temperatura: Math.floor(data.current.temp_c), // somente inteiro
        condicao: condicaoPt,
        icone: getIcon(condicaoPt)
      });
    }

    res.json(resultados);
  } catch (err) {
    console.error("Erro ao buscar dados da API:", err);
    res.status(500).json({ erro: "Erro ao buscar dados da API" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
