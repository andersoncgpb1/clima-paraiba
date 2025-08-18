import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// sua chave da OpenWeatherMap
const API_KEY = "b4287a5c1971d7dc0de18a7304721da7";

// lista das 223 cidades da Paraíba
const cidades = [
  "Água Branca","Aguiar","Alagoa Grande","Alagoa Nova","Alagoinha","Alcantil","Algodão de Jandaíra","Alhandra","Amparo","Aparecida",
  "Araçagi","Arara","Araruna","Areia","Areia de Baraúnas","Areial","Aroeiras","Assunção","Baía da Traição","Bananeiras",
  "Baraúna","Barra de Santa Rosa","Barra de Santana","Barra de São Miguel","Bayeux","Belém","Belém do Brejo do Cruz","Bernardino Batista","Boa Ventura","Boa Vista",
  "Bom Jesus","Bom Sucesso","Bonito de Santa Fé","Boqueirão","Borborema","Brejo do Cruz","Brejo dos Santos","Caaporã","Cabaceiras","Cabedelo",
  "Cachoeira dos Índios","Cacimba de Areia","Cacimba de Dentro","Cacimbas","Caiçara","Cajazeiras","Cajazeirinhas","Caldas Brandão","Camalaú","Campina Grande",
  "Campo de Santana","Capim","Caraúbas","Carrapateira","Casserengue","Catingueira","Catolé do Rocha","Caturité","Conceição","Condado",
  "Conde","Congo","Coremas","Coxixola","Cruz do Espírito Santo","Cubati","Cuité","Cuité de Mamanguape","Cuitegi","Curral de Cima",
  "Curral Velho","Damião","Desterro","Diamante","Dona Inês","Duas Estradas","Emas","Esperança","Fagundes","Frei Martinho",
  "Gado Bravo","Guarabira","Gurinhém","Gurjão","Ibiara","Imaculada","Ingá","Itabaiana","Itaporanga","Itapororoca",
  "Itatuba","Jacaraú","Jericó","João Pessoa","Juarez Távora","Juazeirinho","Junco do Seridó","Juripiranga","Juru","Lagoa",
  "Lagoa de Dentro","Lagoa Seca","Lastro","Livramento","Logradouro","Lucena","Mãe d'Água","Malta","Mamanguape","Manaíra",
  "Marcação","Mari","Marizópolis","Massaranduba","Mataraca","Matinhas","Mato Grosso","Maturéia","Mogeiro","Montadas",
  "Monte Horebe","Monteiro","Mulungu","Natuba","Nazarezinho","Nova Floresta","Nova Olinda","Nova Palmeira","Olho d'Água","Olivedos",
  "Ouro Velho","Parari","Paraíba","Parahyba","Parari","Passagem","Patos","Paulista","Pedra Branca","Pedra Lavrada",
  "Pedras de Fogo","Pedro Régis","Piancó","Picuí","Pilar","Pilões","Pilõezinhos","Pirpirituba","Pitimbu","Pocinhos",
  "Poço Dantas","Poço de José de Moura","Pombal","Prata","Princesa Isabel","Puxinanã","Queimadas","Quixaba","Remígio","Riachão",
  "Riachão do Bacamarte","Riachão do Poço","Riacho de Santo Antônio","Riacho dos Cavalos","Rio Tinto","Salgadinho","Salgado de São Félix","Santa Cecília","Santa Cruz","Santa Helena",
  "Santa Inês","Santa Luzia","Santa Rita","Santa Teresinha","Santana de Mangueira","Santana dos Garrotes","Santarém","Santo André","São Bentinho","São Bento",
  "São Domingos","São Domingos do Cariri","São Francisco","São João do Cariri","São João do Rio do Peixe","São João do Tigre","São José da Lagoa Tapada","São José de Caiana","São José de Espinharas","São José de Piranhas",
  "São José de Princesa","São José do Bonfim","São José do Brejo do Cruz","São José do Sabugi","São José dos Cordeiros","São José dos Ramos","São Mamede","São Miguel de Taipu","São Sebastião de Lagoa de Roça","São Sebastião do Umbuzeiro",
  "Sapé","São Vicente do Seridó","Seridó","Serra Branca","Serra da Raiz","Serra Grande","Serra Redonda","Serraria","Sertãozinho","Sobrado",
  "Solânea","Soledade","Sossêgo","Sousa","Sumé","Taperoá","Tavares","Teixeira","Tenório","Triunfo",
  "Uiraúna","Umbuzeiro","Várzea","Vieirópolis","Vista Serrana","Zabelê"
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
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            cidade
          )},BR&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        const data = await response.json();

        return {
          cidade: cidade,
          temperatura: data.main?.temp ?? "N/A",
          condicao: data.weather?.[0]?.description ?? "N/A",
          hora_local: new Date(data.dt * 1000).toLocaleString("pt-BR") // converte timestamp para horário local
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
