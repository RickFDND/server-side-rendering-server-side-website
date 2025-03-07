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

  let stories = await fetch('https://fdnd-agency.directus.app/items/tm_story')

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

//naar een unieke pagina met een specifieke story//
app.get('/story/:id', async function (request, response) { //route aanmaken voor specifieke story. (story/:id) voor id 11 leid naar story/11
  try {
    const { id } = request.params; //haal het id uit de url

    //maak fetch aanroep naar api met id van url
    const storyResponse = await fetch(`https://fdnd-agency.directus.app/items/tm_story/${id}`);

    //zet response van API om naar JSon
    const storyResponseJSON = await storyResponse.json();

    //check of data er is. Zo niet geef error aan.
    if (!storyResponseJSON.data || storyResponseJSON.data.length === 0) {
      return response.status(404).send('Story not found');
    }

    //render story.liquid en geef juiste story mee.
    response.render('story.liquid', { story: storyResponseJSON.data[0] });
  }

  catch (error) {
    // foutafhandeling in geval van error
    console.error(error);
    response.status(500).send('Er is iets foutgegaan met het ophalen van de story');
  }
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
