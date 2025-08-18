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

// Função para mapear condição do tempo para ícone do GitHub
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

// Endpoint para retornar dados em JSON (pode ser usado pelo vMix)
app.get("/clima", async (req, res) => {
  const resultados = [];

  for (let cidade of cidades) {
    try {
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=5d0ba8b53e344994ad424037251608&q=${encodeURIComponent(cidade)}&aqi=no`);
      const data = await response.json();

      resultados.push({
        cidade: data.location.name,
        temperatura: data.current.temp_c,
        condicao: data.current.condition.text,
        icone: getIcon(data.current.condition.text)
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
