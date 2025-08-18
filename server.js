import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Lista padrão das principais cidades da Paraíba
let cidadesPadrao = [
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

const API_KEY = "5d0ba8b53e344994ad424037251608";

// Converte a condição em português para escolher o ícone
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

// Mapeia condições do inglês para português
function traduzirCondicao(cond) {
  cond = cond.toLowerCase();
  if (cond.includes("sun")) return "Ensolarado";
  if (cond.includes("cloud") && cond.includes("night")) return "Nublado Noite";
  if (cond.includes("cloud") && cond.includes("sun")) return "Nublado com Sol";
  if (cond.includes("cloud")) return "Nublado";
  if (cond.includes("rain") && cond.includes("sun")) return "Chuva com Sol";
  if (cond.includes("rain")) return "Chuva";
  if (cond.includes("storm") && cond.includes("sun")) return "Tempestade com sol";
  if (cond.includes("storm")) return "Tempestade";
  return "Ensolarado";
}

// Endpoint principal
app.get("/clima", async (req, res) => {
  const cidadeQuery = req.query.cidade;
  let cidades = cidadeQuery ? [cidadeQuery] : cidadesPadrao;

  const resultados = [];

  for (let cidade of cidades) {
    try {
      const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(cidade)}&aqi=no`;
      const resp = await fetch(url);
      const data = await resp.json();

      // Traduz condição para português
      const condPort = traduzirCondicao(data.current.condition.text);

      resultados.push({
        cidade: data.location.name,
        temperatura: Math.floor(data.current.temp_c),
        condicao: condPort,
        icone: getIcon(condPort)
      });
    } catch (err) {
      console.error("Erro ao buscar clima da cidade:", cidade, err);
      resultados.push({
        cidade,
        temperatura: "N/A",
        condicao: "N/A",
        icone: getIcon("Ensolarado")
      });
    }
  }

  res.json(resultados);
});

// Servir arquivos estáticos (index.html, CSS, etc.)
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
