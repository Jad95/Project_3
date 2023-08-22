console.log("linegraph.js is being executed.");

d3.json("data/energy.json").then(function (data) {
    // Extract relevant data for the selected country
    const countryData = data.find(country => country.country === "Afghanistan");
    const countryDropdown = document.getElementById('country-selector');

    // Iterate through the data and create options for each country
data.forEach(country => {
  const option = document.createElement('option');
  option.value = country.country;
  option.textContent = country.country;
  countryDropdown.appendChild(option);
});
  // Add an event listener to the dropdown
  countryDropdown.addEventListener('change', function () {
  const selectedCountry = this.value;
  updateLineGraph(selectedCountry);
});

function updateLineGraph(selectedCountry) {
// Fetch the selected country's data from energy.json
d3.json("data/energy.json").then(function(data) {
  const countryData = data.find(country => country.country === selectedCountry);

  // Extract years and energy access values
  const years = Object.keys(countryData.year);
  const accessValues = years.map(year => countryData.year[year].access_to_elec);

  // Update the line graph using Plotly.update
  Plotly.update('energy-access-chart', {
    x: [years], // Update x-axis
    y: [accessValues], // Update y-axis
    type: 'lines+markers', // Update chart type
    name: selectedCountry, // Update legend label
  });
});
}
    // Extract years and energy access values
    const years = Object.keys(countryData.year);
    const accessValues = years.map(year => countryData.year[year].access_to_elec);

    // Create the Plotly Line Chart
    const trace = {
      x: years,
      y: accessValues,
      mode: 'lines+markers',
      name: 'Energy Access',
      marker: {
        size: 8
      }
    };

    const layout = {
      title: 'Energy Access Over Years',
      xaxis: {
        title: 'Year'
      },
      yaxis: {
        title: 'Energy Access (%)'
      }

    };

    Plotly.newPlot('energy-access-chart', [trace], layout);
  });