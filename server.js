import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

const apiKey = '839f9d68e89a408f9f9d68e89a008fd7';

const cidadesPB = [
  { nome: 'Água Branca', lat: -7.5351, lon: -37.2838 },
  { nome: 'Aguiar', lat: -6.8055, lon: -37.5565 },
  { nome: 'Alagoa Grande', lat: -7.1167, lon: -35.6167 },
  { nome: 'Alagoa Nova', lat: -7.0833, lon: -35.6167 },
  { nome: 'Alagoinha', lat: -7.1167, lon: -36.3833 },
  { nome: 'Alcantil', lat: -7.4167, lon: -36.4167 },
  { nome: 'Algodão de Jandaíra', lat: -7.5333, lon: -35.9167 },
  { nome: 'Alhandra', lat: -6.9833, lon: -35.1167 },
  { nome: 'Amparo', lat: -7.5333, lon: -35.6167 },
  { nome: 'Aparecida', lat: -6.9833, lon: -37.1167 },
  { nome: 'Araçagi', lat: -6.9833, lon: -35.6167 },
  { nome: 'Arara', lat: -6.9833, lon: -35.6167 },
  { nome: 'Araruna', lat: -6.9833, lon: -35.6167 },
  { nome: 'Areia', lat: -6.9833, lon: -35.6167 },
  { nome: 'Areia de Baraúnas', lat: -6.9833, lon: -35.6167 },
  { nome: 'Areial', lat: -6.9833, lon: -35.6167 },
  { nome: 'Aroeiras', lat: -6.9833, lon: -35.6167 },
  { nome: 'Assunção', lat: -6.9833, lon: -35.6167 },
  { nome: 'Baía da Traição', lat: -6.9833, lon: -35.6167 },
  { nome: 'Bananeiras', lat: -6.9833, lon: -35.6167 },
  { nome: 'Baraúna', lat: -6.9833, lon: -35.6167 },
  { nome: 'Barra de Santa Rosa', lat: -6.9833, lon: -35.6167 },
  { nome: 'Barra de Santana', lat: -6.9833, lon: -35.6167 },
  { nome: 'Barra de São Miguel', lat: -6.9833, lon: -35.6167 },
  { nome: 'Bayeux', lat: -6.9833, lon: -35.6167 },
  { nome: 'Belém', lat: -6.9833, lon: -35.6167 },
  { nome: 'Belém do Brejo do Cruz', lat: -6.9833, lon: -35.6167 },
  { nome: 'Bernardino Batista', lat: -6.9833, lon: -35.6167 },
  { nome: 'Boa Ventura', lat: -6.9833, lon: -35.6167 },
  { nome: 'Boa Vista', lat: -6.9833, lon: -35.6167 },
  { nome: 'Bom Jesus', lat: -6.9833, lon: -35.6167 },
  { nome: 'Bom Sucesso', lat: -6.9833, lon: -35.6167 },
  { nome: 'Bonito de Santa Fé', lat: -6.9833, lon: -35.6167 },
  { nome: 'Boqueirão', lat: -6.9833, lon: -35.6167 },
  { nome: 'Borborema', lat: -6.9833, lon: -35.6167 },
  { nome: 'Brejo do Cruz', lat: -6.9833, lon: -35.6167 },
  { nome: 'Brejo dos Santos', lat: -6.9833, lon: -35.6167 },
  { nome: 'Caaporã', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cabaceiras', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cabedelo', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cachoeira dos Índios', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cacimba de Areia', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cacimba de Dentro', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cacimbas', lat: -6.9833, lon: -35.6167 },
  { nome: 'Caiçara', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cajazeiras', lat: -6.9833, lon: -35.6167 },
  { nome: 'Cajazeirinhas', lat: -6.9833, lon: -35.6167 },
  { nome: 'Caldas Brandão', lat: -6.9833, lon: -35.6167 },
  { nome: 'Camalaú', lat: -6.9833, lon: -35.6167 },
  { nome: 'Campina Grande', lat: -6.9833, lon: -35.6167 },

// Função para buscar temperatura via Weather Underground
async function getClima(cidade) {
  try {
    const API_KEY = "839f9d68e89a408f9f9d68e89a008fd7";
    const url = `https://api.weather.com/v3/wx/conditions/current?apiKey=${API_KEY}&format=json&language=pt-BR&location=${encodeURIComponent(cidade)},PB`;
    const res = await fetch(url);
    const data = await res.json();

    const temperatura = data.temperature ?? "N/A";

    return {
      cidade,
      temperatura: temperatura !== "N/A" ? Math.round(temperatura) : "N/A"
    };
  } catch (err) {
    return {
      cidade,
      temperatura: "N/A"
    };
  }
}

// Rota principal
app.get("/", (req, res) => {
  res.send("🌤️ API Clima Paraíba - acesse /clima para ver os dados em tempo real.");
});

// Rota /clima
app.get("/", async (req, res) => {
  try {
    const results = [];
    for (const cidade of cidadesPB) {
      const url = `https://api.weather.com/v3/...&lat=${cidade.lat}&lon=${cidade.lon}&apiKey=${apiKey}`;
      const resp = await fetch(url);
      const data = await resp.json();
      results.push({ cidade: cidade.nome, temperatura: data.temperature });
    }
    res.json(results);
  } catch (err) {
    res.json({ erro: "Erro ao buscar dados da API", detalhes: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
