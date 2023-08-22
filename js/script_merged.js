// Creating the map object
let myMap = L.map("map", {
  center: [26.8206, 30.8025],
  zoom: 1
});


// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);


// Use this link to get the GeoJSON data. This makes use of the data from the Flask API
let link = "http://127.0.0.1:5000/api/v1.0/countries_geojson";
let dataLink = "http://127.0.0.1:5000/api/v1.0/data"


// Uncomment if you want to use the local files
// let link = "data/countries.geojson";
// let dataLink = "data/energy.json"


// The function that will determine the color of a neighborhood based on the borough that it belongs to

function chooseColor(Continent) {
  return Continent == "Asia" ? "yellow" :
    Continent == "North America" ? "red" :
      Continent == "South America" ? "Blue" :
        Continent == "Africa" ? "green" :
          Continent == "Europe" ? "purple" :
            Continent == "Oceania" ? "lightblue" :
              Continent == "Antartica" ? "white" :
                "lightgray";
}


// Getting our GeoJSON data
d3.json(link).then(function (data) {

  // Initialize graphs
  initialCountry = "Canada"
  updateLineGraph(initialCountry);
  barchart(initialCountry);
  // co2chart(initialCountry)

  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    // Styling each feature (in this case, a neighborhood)
    style: function (feature) {
      return {
        color: "white",
        // Call the chooseColor() function to decide which color to color our neighborhood. (The color is based on the borough.)
        fillColor: chooseColor(feature.properties.Continent),
        fillOpacity: 0.5,
        weight: 1.5
      };
    },


    // This is called on each feature.
    onEachFeature: function (feature, layer) {
      // Set the mouse events to change the map styling.
      layer.on({
        /* When a user's mouse cursor touches a map feature, the mouseover
        event calls this function, which makes that feature's opacity change to 90% so that it stands out. */
        mouseover: highlightFeature,

        /* When the cursor no longer hovers over a map feature (that is, when the mouseout event occurs), 
        the feature's opacity reverts back to 50%. */
        mouseout: resetHighlight,

        // When a feature (neighborhood) is clicked, it enlarges to fit the screen.
        click: function (event) {
          myMap.fitBounds(event.target.getBounds());
          let selected_country = feature.properties.Country;
          //console.log(selected_country);

          // bubblechart(selected_country);
          updateLineGraph(selected_country);
          barchart(selected_country);
          // co2chart(selected_country);
        }
      });


      // Giving each feature a popup with information that's relevant to it
      layer.bindPopup("<h2>" + feature.properties.Country + "</h2> <hr> <h4> Continent: " + feature.properties.Continent + "</h4>" +
        "<h4> Country Code: " + feature.properties.ISO_A3 + "</h4>");
      ;
    }
  }).addTo(myMap);
}

);


/* Creating a Legend for Continent */
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (myMap) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = ["Asia", "North America", "South America", "Africa", "Europe", "Oceania", "Antartica"],
    labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + chooseColor(grades[i]) + '"></i> ' +
      grades[i] + '<br>';
  }

  return div;
};

legend.addTo(myMap);

/*asdfasd*/
var info = L.control();

info.onAdd = function (myMap) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML = '<h4>Country on cursor</h4>' + (props ?
    '<b>' + props.Country + '</b><br />'
    : 'Hover over a country');
};

info.addTo(myMap);



function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    color: '#666',
    dashArray: '',
    fillOpacity: 0.9
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  var layer = e.target;

  layer.setStyle({
    color: 'white',
    dashArray: '',
    fillOpacity: 0.5
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update();
}



///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Function for bar graph ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


function barchart(selected_country) {
  d3.json(dataLink).then(function (data) {
    let years = Object.keys(data[0].year);
    let fossil_list = [];
    let renew_list = [];

    for (let i = 0; i < data.length; i++) {
      // Determine which country's data you will access
      if (data[i].country == selected_country) {
        for (let j = 0; j < years.length; j++) {
          fossil_list.push(data[i].year[years[j]].elec_from_fossil);
          renew_list.push(data[i].year[years[j]].elec_from_renew);
        }
        break
      }
    }

    //console.log(selected_country);
    //console.log(fossil_list);
    //console.log(renew_list);

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
      title: 'Electricity Generated: Fossil Fuels vs. Renewable',
      yaxis: {
        title: 'Terawatt hour (TWh)'
      }
    };

    Plotly.newPlot('bar-chart', data, layout);
  });
}



///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Function for line graph ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

// The code below was commented off to work with the country selection by clicking on the map

// Extract relevant data for the selected country

// let countryData = data.find(country => country.country === "Canada");
// let countryDropdown = document.getElementById('country-selector');

// Iterate through the data and create options for each country
// data.forEach(country => {
//     let option = document.createElement('option');
//     option.value = country.country;
//     option.textContent = country.country;
//     countryDropdown.appendChild(option);
// });
// Add an event listener to the dropdown
// countryDropdown.addEventListener('change', function () {
//     let selectedCountry = this.value;
//     updateLineGraph(selectedCountry);
// });


function updateLineGraph(selectedCountry) {
  // Fetch the selected country's data from energy.json
  d3.json(dataLink).then(function (data) {
    countryData = data.find(country => country.country === selectedCountry);

    // Extract years and energy access values
    years = Object.keys(countryData.year);
    accessValues = years.map(year => countryData.year[year].access_to_elec);

    // Update the line graph using Plotly.update

    Plotly.newPlot('line-graph', {
      x: [years], // Update x-axis
      y: [accessValues], // Update y-axis
      type: 'lines+markers', // Update chart type
      name: selectedCountry, // Update legend label
    });

    // Create the Plotly Line Chart
    let trace = {
      x: years,
      y: accessValues,
      mode: 'lines+markers',
      name: 'Energy Access',
      marker: {
        size: 8,
        color: 'rgb(84,239,7)',
      }
    };

    let layout = {
      title: 'Percentage of Population with Access to Energy',
      xaxis: {
        title: 'Year'
      },
      yaxis: {
        title: 'Energy Access (%)'
      }

    };
    Plotly.newPlot('line-graph', [trace], layout);
  });
}



///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////// Function for CO2 graph (Plotly) /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

/////////////// Uncomment the code below along with the code in style.css to //////////////////

// d3.json(dataLink).then(function(data) {
//   console.log(data);
// });

// function co2chart(selected_country) {
//   d3.json(dataLink).then(function (data) {
//     let years = Object.keys(data[0].year);
//     let co2 = [];


//     for (let i = 0; i < data.length; i++) {
//       // Determine which country's data you will access
//       if (data[i].country == selected_country) {
//         for (let b = 0; b < years.length; b++) {
//           co2.push(data[i].year[years[b]].co2_emissions);
//         }
//         break
//       }
//     }
//     //Create chart
//     var trace = {
//       x: years,
//       y: co2,
//       name: "CO2 Emision in kt",
//       type: "bar",
//     };
//     var data = [trace];
//     var layout = {
//       title: "CO2 Emision per Year",
//       yaxis: {
//         title: 'kt'
//       }
//     };

//     Plotly.newPlot("co2chart", data, layout);
//   });
// };