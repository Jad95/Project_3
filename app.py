import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify

# Database setup
engine = create_engine("sqlite:///data/energy.db")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(autoload_with=engine)

# Create an app, being sure to pass __name__
app = Flask(__name__)
Energy_table = Base.classes.energy

# Define what to do when a user hits the index route
@app.route("/")
def home():
    print("Server received request for 'Home' page...")
    return (f"Project 3 API<br/>"
            f"Available routes:<br/>"
            f"/api/v1.0/countries<br/>"
            f"/api/v1.0/country_data/<country_input>")

@app.route("/api/v1.0/countries")
def countries():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    # Query all the distinct countries
    results = session.query(Energy_table.country).distinct().all()

    session.close()

    # Create a list to hold all country names
    all_countries = []

    for country in results:
        all_countries.append(country[0])

    return jsonify(all_countries)

@app.route("/api/v1.0/country_data/<country_name>")
def country_data(country_name):

    # Create our session (link) from Python to the DB
    session = Session(engine)

    # These are the columns we want for the graph. 
    want_columns = ['country', 'year', 'access_to_elec', 'elec_from_renew',
                 'low_carbon_elec', 'co2_emissions', 'primary_energy_cons']

    # Query for the country and its data on the database
    country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
    results = session.query(Energy_table.country, Energy_table.year, Energy_table.access_to_elec,
    Energy_table.elec_from_renew, Energy_table.low_carbon_elec, Energy_table.co2_emissions,
    Energy_table.primary_energy_cons).filter(Energy_table.country == country_name).all()

    # Close the session
    session.close()

    # Create a dictionary to jsonify for the API
    country_data = [{country: {}}]
    country_dict = {'year': {}}
    for row in results:

        # row[1] is the year
        country_dict['year'][str(row[1])] = {}

        # We start at 2 as the first 2 elements of the list are the country name and the year
        for i in range(2,len(row)):
            country_dict['year'][str(row[1])][want_columns[i]] = row[i]

    country_data[0][country] = country_dict

    return jsonify(country_data)


if __name__ == "__main__":
    app.run(debug=True)