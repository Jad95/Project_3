// Creating the map object
let myMap = L.map("map", {
  center: [26.8206, 30.8025],
  zoom: 1
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Use this link to get the GeoJSON data.
let link = "data/countries.geojson";

// The function that will determine the color of a neighborhood based on the borough that it belongs to
function chooseColor(Continent) {
  if (Continent == "Asia") return "yellow";
  else if (Continent == "North America") return "red";
  else if (Continent == "South America") return "Blue";
  else if (Continent == "Africa") return "green";
  else if (Continent == "Europe") return "purple";
  else if (Continent == "Oceania") return "lightblue";
  else return "white";
}

// Getting our GeoJSON data
d3.json(link).then(function(data) {
  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    // Styling each feature (in this case, a neighborhood)
    style: function(feature) {
      return {
        color: "white",
        // Call the chooseColor() function to decide which color to color our neighborhood. (The color is based on the borough.)
        fillColor: chooseColor(feature.properties.Continent),
        fillOpacity: 0.5,
        weight: 1.5
      };
    },
    // This is called on each feature.
    onEachFeature: function(feature, layer) {
      // Set the mouse events to change the map styling.
      layer.on({
        // When a user's mouse cursor touches a map feature, the mouseover event calls this function, which makes that feature's opacity change to 90% so that it stands out.
        mouseover: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.9
          });
        },
        // When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), the feature's opacity reverts back to 50%.
        mouseout: function(event) {
          layer = event.target;
          layer.setStyle({
            fillOpacity: 0.5
          });
        },
        // When a feature (neighborhood) is clicked, it enlarges to fit the screen.
        click: function(event) {
          myMap.fitBounds(event.target.getBounds());
          let selected_country = feature.properties.Country;
          //console.log(selected_country);
          bubblechart(selected_country);
          barchart(selected_country);
        }
      });
      // Giving each feature a popup with information that's relevant to it
      layer.bindPopup("<h1>" + feature.properties.Country + "</h1> <hr> <h2>" + feature.properties.ISO_A3 + "</h2>"); 
    }
  }).addTo(myMap);
});
  


//sample chart 1
function bubblechart(selected_country){
    var trace1 = {
      x: [1, 2, 3, 4],
      y: [10, 11, 12, 13],
      mode: 'markers',
      marker: {
        size: [40, 60, 80, 100]
      }
    };

    var data = [trace1];

    var layout = {
      title: selected_country,
      showlegend: false,
      height: 300,
      width: 600
    };

    Plotly.newPlot('bubble-chart', data, layout)
}

//sample chart 2 use 

function barchart(selected_country){
    var trace1 = {
      x: ['giraffes', 'orangutans', 'monkeys'],
      y: [20, 14, 23],
      name: 'SF Zoo',
      type: 'bar'
    };

    var trace2 = {
      x: ['giraffes', 'orangutans', 'monkeys'],
      y: [12, 18, 29],
      name: 'LA Zoo',
      type: 'bar'
    };

    var data = [trace1, trace2];

    var layout = {
      barmode: 'group', 
      width: 600, 
      height: 300, 
      };

    Plotly.newPlot('bar-chart', data, layout);
  }
