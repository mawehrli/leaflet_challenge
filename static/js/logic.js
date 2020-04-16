// Store our API endpoint inside earthquakeURL
// Reference class exercise 17.1 #10
var earthquakeURL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create variable to fetch tectonicplates boundaries
var tectonicPlatesURL =
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
// Reference class exercise 17.1 #10
d3.json(earthquakeURL, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the magnitude, place and time of the earthquake
// Reference class exercise 17.1 #10
function createFeatures(earthquakeData) {

  // Create earthquakes variable and a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  // Reference class exercise 17.1 #10
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, layer) {

      // Give each feature a popup describing the magnitude, place and time of the earthquake
      // Reference class exercise 17.1 #10
      layer.bindPopup(
        "<h3>Magnitude: " +
          feature.properties.mag +
          "</h3><h3>Location: " +
          feature.properties.place +
          "</h3><hr><h3>" +
          new Date(feature.properties.time) +
          "</h3>"
      );
    },

    //Add circles to map for earthquakes layer
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng, {
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: 0.6,
        color: "#000",
        stroke: true,
        weight: 0.8,
      });
    },
  });
  // Send the earthquakes layer to the createMap function
  createMap(earthquakes);
}
function createMap(earthquakes) {
  
  // Define variables for tile layers
  var satellite = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
      id: "mapbox.satellite",
      accessToken: API_KEY,
    }
  );

  var lightmap = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
      id: "mapbox.light",
      accessToken: API_KEY,
    }
  );

  var streets = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 20,
      id: "mapbox.streets",
      accessToken: API_KEY,
    }
  );

  // Define a baseMaps object to hold our base layers (only one base layer can be shown at a time).
  // Pass in our baseMaps
  var baseMaps = {
    Satellite: satellite,
    Grayscale: lightmap,
    Streets: streets,
  };

  // Create a tectonic plates layer //
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer (that can be toggled on or off)
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates,
  };

  // Create our map, giving it the streets, earthquakes and tectonic plates layers to display on load
  var myMap = L.map("map", {
    // San Francisco as center
    center: [37.7749, -122.4194],
    zoom: 3,
    layers: [satellite, earthquakes, tectonicPlates],
  });

  // Add fault lines
  d3.json(tectonicPlatesURL, function (plateData) {
    // Adding our geoJSON data and styling to tectonicPlates
    L.geoJson(plateData, {
      color: "#DC381F",
      weight: 1.2,
    }).addTo(tectonicPlates);
  });

  // Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      // make overlay control choices visible
      collapsed: false,
    })
    .addTo(myMap);

  //Create legend based on earthquake magnitude
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend"),
      magnitude = [0, 1, 2, 3, 4, 5];
      
    // loop through our density intervals and generate a label with a colored square for each legend interval
    for (var i = 0; i < magnitude.length; i++) {
      
      div.innerHTML +=
        '<i style="background-color:' +
        getColor(magnitude[i] + 1) +
        ';">' +
        magnitude[i] +
        (magnitude[i + 1] ? "&ndash;" + magnitude[i + 1] + "<br>" + "</i> " : "+");
    }
    return div;
  };
  legend.addTo(myMap);

}

//Create color range for the circles
function getColor(d) {
  return d > 5
    ? "red"
    : d > 4
    ? "orange"
    : d > 3
    ? "gold"
    : d > 2
    ? "orange"
    : d > 1
    ? "yellow"
    : "green"; // <= 1 default
}

//Change the magnitude of the earthquake by a factor of 50,000 for the radius of the circle.
function getRadius(value) {
  return value * 50000;
}
