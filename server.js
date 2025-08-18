import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Lista das cidades principais da Paraíba
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

// Mapeamento das condições em inglês para português
function traduzirCondicao(condition) {
  const c = condition.toLowerCase();
  if (c.includes("sunny") || c.includes("clear")) return "Ensolarado";
  if (c.includes("partly cloudy")) return "Nublado com Sol";
  if (c.includes("cloudy")) return "Nublado";
  if (c.includes("rain") && c.includes("sun")) return "Chuva com Sol";
  if (c.includes("rain")) return "Chuva";
  if (c.includes("thunder") && c.includes("sun")) return "Tempestade com sol";
  if (c.includes("thunder")) return "Tempestade";
  return "Ensolarado";
}

// Função para retornar o ícone correto
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

app.get("/clima", async (req, res) => {
  const apiKey = "5d0ba8b53e344994ad424037251608";
  const resultados = [];

  for (const cidade of cidades) {
    try {
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(cidade)}&aqi=no`);
      const data = await response.json();

      const condicao = traduzirCondicao(data.current.condition.text);
      resultados.push({
        cidade,
        temperatura: Math.floor(data.current.temp_c), // apenas inteiro
        condicao,
        icone: getIcon(condicao)
      });
    } catch (err) {
      resultados.push({
        cidade,
        temperatura: "-",
        condicao: "-",
        icone: getIcon("Ensolarado")
      });
    }
  }

  res.json(resultados);
});

app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
