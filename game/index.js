import roads from '../streets.json';
import * as turf from '@turf/turf'; // Make sure Turf is installed via npm

let displayMode = "light"
let gameMode = 1;

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

function DrawStreet(name, colour) {
  const filteredFeatures = roads.features.filter(
    f => f.properties.name === name
  );

  const fc = turf.featureCollection(filteredFeatures);
  const combined = turf.combine(fc);

  const layer = L.geoJSON(combined, {
    style: { color: colour, weight: 5, opacity: 0.9 }
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
const skipButtons = document.getElementsByClassName("skip-button");

async function getClosestStreetName(coords) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`;
  try {
      const response = await fetch(url, {headers: {"User-Agent": "LeafletStreetLookup/1.0"}});
      if (!response.ok) {
          throw new Error("Reverse geocoding failed");
      }
      const data = await response.json();

      return (
          data.address.road ||
          data.address.pedestrian ||
          data.address.cycleway ||
          data.address.footway ||
          "Unknown street"
      );
    } catch (err) {
        console.error(err);
        return null;
    }
  }

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

document.addEventListener("click", () => {
  if (gameMode == 1) {
    map.on('click', async function(e) {
      ClearMap();
      let clickLatLong = e.latlng;
      let roadName = await getClosestStreetName(clickLatLong);
      DrawStreet(roadName, "blue");
    });
  }
})

for (let i = 0; i < skipButtons.length; i++) {
  skipButtons[i].addEventListener("click", () => {
    console.log("skipping")
    ClearMap();
    InitiateGame(gameMode);
  })
}

function InitiateGame(gm){
  for (let i = 0; i <= 1; i++) {
    if (i != gm) {
      document.getElementById(`gamemode${i}`).style.display = "none";
    }
  }
  switch (gm) {
    case 0:
        currentStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
        DrawStreet(currentStreet, "red");
        break;
    case 1:
      currentStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
      document.getElementById("street-name").innerHTML = currentStreet;
  }
}

InitiateGame(gameMode);