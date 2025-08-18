// server.js
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = "5d0ba8b53e344994ad424037251608"; // Sua chave WeatherAPI

// Lista de cidades da Paraíba
const cidadesPB = [
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

// Função para obter ícone de clima
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

  // padrão
  return iconesBase + "Ensolarado.png";
}

// Endpoint que retorna o clima
app.get("/clima", async (req, res) => {
  try {
    const resultados = [];

    for (const cidade of cidadesPB) {
      const query = encodeURIComponent(`${cidade}, PB, Brazil`);
      const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${query}&aqi=no`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.current) {
        const temperatura = Math.floor(data.current.temp_c); // apenas número inteiro
        const condicao = data.current.condition.text;
        const icone = getIcon(condicao);

        resultados.push({
          cidade,
          temperatura,
          condicao,
          icone
        });
      } else {
        resultados.push({
          cidade,
          temperatura: "N/A",
          condicao: "N/A",
          icone: getIcon("ensolarado")
        });
      }
    }

    res.json(resultados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: err.message });
  }
});

// Servir arquivos estáticos do public
app.use(express.static("public"));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
