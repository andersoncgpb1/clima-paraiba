// server.js
// Node >=18 (Render usa 22) — ESM puro

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cities from "./cities_pb.js"; // 223 cidades (arquivo abaixo)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Coloque sua chave no Dashboard do Render: Environment → Add Env Var
// Name: OPENWEATHER_API_KEY   Value: <sua_chave>
const OWM_KEY = process.env.OPENWEATHER_API_KEY;

// Config
const CACHE_MS = 10 * 60 * 1000; // 10 min
const GROUP_SIZE = 20;           // limite do endpoint /group da OWM
const GROUP_DELAY_MS = 1000;     // 1s entre grupos, para evitar rate limit

// Cache em memória
let cache = { data: null, expiresAt: 0 };

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// Util
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

async function fetchGroup(ids) {
  const url = `https://api.openweathermap.org/data/2.5/group?id=${ids.join(",")}&appid=${OWM_KEY}&units=metric&lang=pt_br`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`OWM HTTP ${res.status} ${txt || ""}`.trim());
  }
  return res.json();
}

async function getWeatherAll() {
  if (!OWM_KEY) {
    throw new Error("Defina a variável de ambiente OPENWEATHER_API_KEY no Render.");
  }

  if (cache.data && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const idToName = new Map(cities.map(c => [c.id, c.name]));
  const idChunks = chunk(cities.map(c => c.id), GROUP_SIZE);
  const results = [];

  for (let i = 0; i < idChunks.length; i++) {
    const ids = idChunks[i];
    try {
      const json = await fetchGroup(ids);
      if (json && Array.isArray(json.list)) {
        for (const item of json.list) {
          results.push({
            cidade: idToName.get(item.id) || item.name || "",
            id: item.id,
            temperatura: item?.main?.temp ?? null,         // sem arredondar (frontend decide)
            condicao: item?.weather?.[0]?.description ?? null,
            icon: item?.weather?.[0]?.icon ?? "default",
            vento: item?.wind?.speed ?? null,              // m/s
            umidade: item?.main?.humidity ?? null,
            pressao: item?.main?.pressure ?? null,
            dt: item?.dt ?? null
          });
        }
      }
    } catch (e) {
      // se um grupo falhar, devolve placeholders para esses IDs
      for (const id of ids) {
        results.push({
          cidade: idToName.get(id) || "",
          id,
          temperatura: null,
          condicao: null,
          icon: "default",
          vento: null,
          umidade: null,
          pressao: null,
          dt: null,
          erro: true
        });
      }
    }
    if (i < idChunks.length - 1) await delay(GROUP_DELAY_MS);
  }

  // Garante presença de todos os IDs (se a OWM não retornar algum)
  const seen = new Set(results.map(r => r.id));
  for (const c of cities) {
    if (!seen.has(c.id)) {
      results.push({
        cidade: c.name,
        id: c.id,
        temperatura: null,
        condicao: null,
        icon: "default",
        vento: null,
        umidade: null,
        pressao: null,
        dt: null
      });
    }
  }

  const payload = {
    atualizadoEm: new Date().toISOString(),
    total: results.length,
    clima: results
  };
  cache = { data: payload, expiresAt: Date.now() + CACHE_MS };
  return payload;
}

// API
app.get("/clima", async (req, res) => {
  try {
    const data = await getWeatherAll();
    res.set("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: String(err.message || err) });
  }
});

// Healthcheck
app.get("/health", (req, res) => res.send("ok"));

// SPA fallback (se quiser acessar / diretamente)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
