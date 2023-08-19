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
          barchart(selected_country);
        }
      });
      // Giving each feature a popup with information that's relevant to it
      layer.bindPopup("<h1>" + feature.properties.Country + "</h1> <hr> <h2>" + feature.properties.ISO_A3 + "</h2>"); 
    }
  }).addTo(myMap);
});
  



// Fossil Fuel vs Renewable Energy Bar Chart 
let enerLink = "./data/energy.json";

d3.json(enerLink).then(function(data) {
  console.log(data);
});

function barchart(selected_country){
  d3.json(enerLink).then(function(data) {
    let years = Object.keys(data[0].year);
    let fossil_list = [];
    let renew_list = [];
    
    for (let i=0; i<data.length; i++) {
      // Determine which country's data you will access
      if(data[i].country == selected_country) {
        for (let j=0; j<years.length; j++) {
          fossil_list.push(data[i].year[years[j]].elec_from_fossil);
          renew_list.push(data[i].year[years[j]].elec_from_renew);
        }
        break
      }
    }
    
    console.log(selected_country);
    console.log(fossil_list);
    console.log(renew_list);
  
    // Create chart
    var trace1 = {
      x: years,
      y: fossil_list,
      type: 'bar',
      name: 'Fossil Fuel',
      marker: {
        color: 'rgb(0,0,0)',
        opacity: 0.5
      }
    };

    var trace2 = {
      x: years,
      y: renew_list,
      type: 'bar',
      name: 'Renewable',
      marker: {
        color: 'rgb(84,239,7)',
        opacity: 0.5
      }
    };
  
    var data = [trace1, trace2];
  
    var layout = {
      title: selected_country,
      yaxis: {
        title: 'Terawatt hour (TWh)'
      }
    };
  
    Plotly.newPlot('bar-chart', data, layout);
  });
}
