import roads from './streets.json';
import * as turf from '@turf/turf'; // Make sure Turf is installed via npm

let displayMode = "light"
let gameMode = 0;

// POSSIBLE GAMEODES:
// Guess the name of the street
// Find where the street is
// Name every Street in London / the knowledge
// Learn the runs
// Find the points of interest
// Eventually greater london mode?

const map = L.map('map').setView([51.5074, -0.1278], 12);
let streetNames = []
roads.features.forEach(feature => {
  streetNames.push(feature.properties.name);
})
let currentStreet;

L.tileLayer(
    `https://{s}.basemaps.cartocdn.com/${displayMode}_nolabels/{z}/{x}/{y}.png`,
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }
).addTo(map);

const grouped = {};

roads.features.forEach(feature => {
  const name = feature.properties.name || 'Unnamed Road';
  if (!grouped[name]) grouped[name] = [];
  grouped[name].push(feature.geometry.coordinates);
});

function DrawStreet(name) {
  const filteredFeatures = roads.features.filter(
    f => f.properties.name === name
  );

  const fc = turf.featureCollection(filteredFeatures);
  const combined = turf.combine(fc);

  const layer = L.geoJSON(combined, {
    style: { color: 'red', weight: 5, opacity: 0.9 }
  }).addTo(map).bindPopup(name);

  map.fitBounds(layer.getBounds());
}

function ClearMap() {
  map.eachLayer(layer => {
    if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
  });
}

function Abbreviate(name) {
  if (name.includes("road")) {
    return name.replace("road", "rd");
  }
  if (name.includes("street")) {
    return name.replace("street", "st");
  }
}

const input = document.getElementById('answer-box');
const skip = document.getElementById("skip-button");

input.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    const value = input.value.trim();
    if (value.toLowerCase() == currentStreet.toLowerCase() || value.toLowerCase() == Abbreviate(currentStreet.toLowerCase())) {
      input.value = "";
      ClearMap();
      InitiateGame();
    }
  }
});

skip.addEventListener("click", () => {
  ClearMap();
  InitiateGame();
})

function InitiateGame(){
  currentStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
  DrawStreet(currentStreet);
}

InitiateGame();

