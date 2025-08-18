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

// Função para normalizar o nome da cidade (remover acentos)
function normalizarCidade(nome) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função para traduzir condição do inglês para português
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
  return cond; // Padrão
}

// Função para pegar o ícone correspondente
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

// Endpoint de clima
app.get("/clima", async (req, res) => {
  const apiKey = "5d0ba8b53e344994ad424037251608";
  const resultados = [];

  for (const cidade of cidades) {
    try {
      // Normaliza o nome da cidade e adiciona ', Brazil' para a API
      const cidadeQuery = encodeURIComponent(normalizarCidade(cidade) + ", Brazil");
      const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cidadeQuery}&aqi=no`);
      const data = await response.json();

      const condicao = traduzirCondicao(data.current.condition.text);
      resultados.push({
        cidade,
        temperatura: Math.floor(data.current.temp_c), // Apenas inteiros
        condicao,
        icone: getIcon(condicao)
      });
    } catch (err) {
      console.error("Erro ao buscar clima de", cidade, err);
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

// Servir arquivos estáticos (index.html, CSS, JS)
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
