// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';


console.log('Hieronder moet je waarschijnlijk nog wat veranderen')
// Doe een fetch naar de data die je nodig hebt
// const apiResponse = await fetch('...')
const apiResponse = await fetch('https://fdnd-agency.directus.app/items/tm_story')
// Lees van de response van die fetch het JSON object in, waar we iets mee kunnen doen
// const apiResponseJSON = await apiResponse.json()
const apiResponseJSON = await apiResponse.json()
// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
console.log(apiResponseJSON)


// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {

  let stories = await fetch('https://fdnd-agency.directus.app/items/tm_story?fields=*,audio.audio_file,audio.transcript')

  let storiesJSON = await stories.json()

  console.log(storiesJSON)
   // Render index.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('index.liquid', { stories: storiesJSON.data })
})

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/', async function (request, response) {
  // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
  // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
  response.redirect(303, '/')
})

//naar een unieke pagina met een specifieke story een slug//
app.get('/story/:id', async function (request, response) {
  const storyResponse = await fetch(`https://fdnd-agency.directus.app/items/tm_story?filter={"id":"${request.params.id}"}&fields=*,audio.audio_file,audio.transcript`);
  const storyResponseJSON = await storyResponse.json();

  // Controleer of er data is voor de opgegeven story
  if (!storyResponseJSON.data || storyResponseJSON.data.length === 0) {
    return response.status(404).send('Story not found');
  }

  // Render de 'story.liquid' pagina met de opgehaalde story data
  response.render('story.liquid', { story: storyResponseJSON.data[0] });
});



//story transcript (later nog koppelen aan de audio)
app.get('/story/:id/vtt', async function (request, response) {
  
  const storyResponse = await fetch(`https://fdnd-agency.directus.app/items/tm_story?filter={"id":"${request.params.id}"}&fields=*,audio.transcript`);
  const storyResponseJSON = await storyResponse.json();

  // Controleer of er data is voor de opgegeven story
  if (!storyResponseJSON.data || storyResponseJSON.data.length === 0) {
    return response.status(404).send('Story not found');
  }
  
  // Render de 'story.liquid' pagina met de opgehaalde story data
  response.send(storyResponseJSON.data[0].audio[0].transcript);
})

//huts
app.get('/a/', (req, res) => {
  res.send('hallo')
})

//foutmelding
app.use((req, res, next) => {
  res.redirect('/'); // Gebruiker wordt doorgestuurd naar de /home pagina
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
