import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// sua chave do Google Geocoding API
const GOOGLE_API_KEY = "AIzaSyAvjB37MeRV-bx8EVXnvbuTGMvEDALs8KA";
// sua chave da OpenWeatherMap
const OPENWEATHER_API_KEY = "b4287a5c1971d7dc0de18a7304721da7";

// lista completa das 223 cidades da Paraíba
const cidadesPB = [
    {nome: "Água Branca"}, {nome: "Aguiar"}, {nome: "Alagoa Grande"}, {nome: "Alagoa Nova"},
    {nome: "Alagoinha"}, {nome: "Alcantil"}, {nome: "Algodão de Jandaíra"}, {nome: "Alhandra"},
    {nome: "Amparo"}, {nome: "Aparecida"}, {nome: "Araçagi"}, {nome: "Arara"}, {nome: "Araruna"},
    {nome: "Areia"}, {nome: "Areia de Baraúnas"}, {nome: "Areial"}, {nome: "Aroeiras"},
    {nome: "Assunção"}, {nome: "Baía da Traição"}, {nome: "Bananeiras"}, {nome: "Baraúna"},
    {nome: "Barra de Santa Rosa"}, {nome: "Barra de Santana"}, {nome: "Barra de São Miguel"},
    {nome: "Bayeux"}, {nome: "Belém"}, {nome: "Belém do Brejo do Cruz"}, {nome: "Bernardino Batista"},
    {nome: "Boa Ventura"}, {nome: "Boa Vista"}, {nome: "Bom Jesus"}, {nome: "Bom Sucesso"},
    {nome: "Bonito de Santa Fé"}, {nome: "Boqueirão"}, {nome: "Borborema"}, {nome: "Brejo do Cruz"},
    {nome: "Brejo dos Santos"}, {nome: "Caaporã"}, {nome: "Cabaceiras"}, {nome: "Cabedelo"},
    {nome: "Cachoeira dos Índios"}, {nome: "Cacimba de Areia"}, {nome: "Cacimba de Dentro"},
    {nome: "Cacimbas"}, {nome: "Caiçara"}, {nome: "Cajazeiras"}, {nome: "Cajazeirinhas"},
    {nome: "Caldas Brandão"}, {nome: "Camalaú"}, {nome: "Campina Grande"}, {nome: "Capim"},
    {nome: "Caraúbas"}, {nome: "Carrapateira"}, {nome: "Casserengue"}, {nome: "Catingueira"},
    {nome: "Catolé do Rocha"}, {nome: "Caturité"}, {nome: "Conceição"}, {nome: "Condado"},
    {nome: "Conde"}, {nome: "Congo"}, {nome: "Coremas"}, {nome: "Coxixola"}, {nome: "Cruz do Espírito Santo"},
    {nome: "Cubati"}, {nome: "Cuité"}, {nome: "Cuité de Mamanguape"}, {nome: "Cuitegi"}, {nome: "Curral de Cima"},
    {nome: "Curral Velho"}, {nome: "Damião"}, {nome: "Desterro"}, {nome: "Diamante"}, {nome: "Dona Inês"},
    {nome: "Duas Estradas"}, {nome: "Emas"}, {nome: "Esperança"}, {nome: "Fagundes"}, {nome: "Frei Martinho"},
    {nome: "Gado Bravo"}, {nome: "Guarabira"}, {nome: "Gurinhém"}, {nome: "Gurjão"}, {nome: "Ibiara"},
    {nome: "Igaracy"}, {nome: "Imaculada"}, {nome: "Ingá"}, {nome: "Itabaiana"}, {nome: "Itaporanga"},
    {nome: "Itapororoca"}, {nome: "Itatuba"}, {nome: "Jacaraú"}, {nome: "Jericó"}, {nome: "João Pessoa"},
    {nome: "Juarez Távora"}, {nome: "Juazeirinho"}, {nome: "Junco do Seridó"}, {nome: "Juripiranga"},
    {nome: "Juru"}, {nome: "Lagoa"}, {nome: "Lagoa de Dentro"}, {nome: "Lagoa Seca"}, {nome: "Lastro"},
    {nome: "Livramento"}, {nome: "Logradouro"}, {nome: "Lucena"}, {nome: "Mãe d'Água"}, {nome: "Malta"},
    {nome: "Mamanguape"}, {nome: "Manaíra"}, {nome: "Marcação"}, {nome: "Mari"}, {nome: "Marizópolis"},
    {nome: "Massaranduba"}, {nome: "Mataraca"}, {nome: "Matinhas"}, {nome: "Mato Grosso"}, {nome: "Maturéia"},
    {nome: "Mogeiro"}, {nome: "Montadas"}, {nome: "Monte Horebe"}, {nome: "Monteiro"}, {nome: "Mulungu"},
    {nome: "Natuba"}, {nome: "Nazarezinho"}, {nome: "Nova Floresta"}, {nome: "Nova Olinda"}, {nome: "Nova Palmeira"},
    {nome: "Olho d'Água"}, {nome: "Olivedos"}, {nome: "Ouro Velho"}, {nome: "Parari"}, {nome: "Passagem"},
    {nome: "Patos"}, {nome: "Paulista"}, {nome: "Pedra Branca"}, {nome: "Pedra Lavrada"}, {nome: "Pedras de Fogo"},
    {nome: "Pedro Régis"}, {nome: "Piancó"}, {nome: "Picuí"}, {nome: "Pilar"}, {nome: "Pilões"},
    {nome: "Pilõezinhos"}, {nome: "Pirpirituba"}, {nome: "Pitimbu"}, {nome: "Pocinhos"}, {nome: "Poço Dantas"},
    {nome: "Poço de José de Moura"}, {nome: "Pombal"}, {nome: "Prata"}, {nome: "Princesa Isabel"}, {nome: "Puxinanã"},
    {nome: "Queimadas"}, {nome: "Quixabá"}, {nome: "Remígio"}, {nome: "Riachão"}, {nome: "Riachão do Bacamarte"},
    {nome: "Riachão do Poço"}, {nome: "Riacho de Santo Antônio"}, {nome: "Riacho dos Cavalos"}, {nome: "Rio Tinto"},
    {nome: "Salgadinho"}, {nome: "Salgado de São Félix"}, {nome: "Santa Cecília"}, {nome: "Santa Cruz"},
    {nome: "Santa Helena"}, {nome: "Santa Inês"}, {nome: "Santa Luzia"}, {nome: "Santa Rita"}, {nome: "Santa Teresinha"},
    {nome: "Santana de Mangueira"}, {nome: "Santana dos Garrotes"}, {nome: "Santo André"}, {nome: "São Bentinho"},
    {nome: "São Bento"}, {nome: "São Domingos"}, {nome: "São Domingos do Cariri"}, {nome: "São Francisco"},
    {nome: "São João do Cariri"}, {nome: "São João do Rio do Peixe"}, {nome: "São João do Tigre"}, {nome: "São José da Lagoa Tapada"},
    {nome: "São José de Caiana"}, {nome: "São José de Espinharas"}, {nome: "São José de Piranhas"}, {nome: "São José de Princesa"},
    {nome: "São José do Bonfim"}, {nome: "São José do Brejo do Cruz"}, {nome: "São José do Sabugi"}, {nome: "São José dos Cordeiros"},
    {nome: "São José dos Ramos"}, {nome: "São Mamede"}, {nome: "São Miguel de Taipu"}, {nome: "São Sebastião de Lagoa de Roça"},
    {nome: "São Sebastião do Umbuzeiro"}, {nome: "Sapé"}, {nome: "Seridó"}, {nome: "Serra Branca"}, {nome: "Serra da Raiz"},
    {nome: "Serra Grande"}, {nome: "Serra Redonda"}, {nome: "Serraria"}, {nome: "Sertãozinho"}, {nome: "Sobrado"},
    {nome: "Solânea"}, {nome: "Soledade"}, {nome: "Sossêgo"}, {nome: "Sousa"}, {nome: "Sumé"}, {nome: "Taperoá"},
    {nome: "Tavares"}, {nome: "Teixeira"}, {nome: "Tenório"}, {nome: "Triunfo"}, {nome: "Uiraúna"}, {nome: "Umbuzeiro"},
    {nome: "Várzea"}, {nome: "Vieirópolis"}, {nome: "Vista Serrana"}, {nome: "Zabelê"}
];

app.get("/clima", async (req, res) => {
  try {
    const resultados = await Promise.all(
      cidadesPB.map(async (cidade) => {
        // Geocoding API
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cidade.nome)},PB,BR&key=${GOOGLE_API_KEY}`
        );
        const geoData = await geoRes.json();
        const location = geoData.results?.[0]?.geometry?.location;

        if (!location) return { cidade: cidade.nome, temperatura: "N/A" };

        // OpenWeatherMap API
        const climaRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
        );
        const climaData = await climaRes.json();

        return {
          cidade: cidade.nome,
          temperatura: climaData.main?.temp ? Math.round(climaData.main.temp) : "N/A"
        };
      })
    );

    res.json({ clima: resultados });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar dados da API", detalhes: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
