import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify
import json

# Opens the geojson file for the countries and saves it into countries_geojson
with open('data/countries.geojson') as f:
   countries_geojson = json.load(f)

# Database setup
engine = create_engine("sqlite:///data/energy.db")

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(autoload_with=engine)

# Create an app, being sure to pass __name__
app = Flask(__name__)
Energy_table = Base.classes.energy

######################### Create a list of all countries ######################
# Create our session (link) from Python to the DB
session = Session(engine)

# Query all the distinct countries
results = session.query(Energy_table.country).distinct().all()

session.close()

# Create a list to hold all country names
all_countries = []

for country in results:
    all_countries.append(country[0])

###############################################################################

# Define what to do when a user hits the index route
@app.route("/")
def home():
    print("Server received request for 'Home' page...")
    return (f"Project 3 API<br/>"
            f"Available routes:<br/>"
            f"/api/v1.0/countries_geojson  (This is the link for the geojson of the countries)<br/>"
            f"/api/v1.0/data  (Complete data for all countries)<br/>"
            f"/api/v1.0/countries  (List of all countries)<br/>"
            f"/api/v1.0/country_data/(country_name)<br/>"
            f"/api/v1.0/country_data/(country_name)/(data)<br/>"
            "Options for data:<br/>"
            "access_to_elec<br/>"
            "elec_from_renew<br/>"
            "low_carbon_elec<br/>" 
            "co2_emissions<br/>"
            "primary_energy_cons")


# A route for a list of all countries
@app.route("/api/v1.0/countries")
def countries():
    # Print out all the countries
    return jsonify(all_countries)


# A route for the geojson used for the map data
@app.route("/api/v1.0/countries_geojson")
def country_geojson():
    return jsonify(countries_geojson)


# A route for energy.json
@app.route("/api/v1.0/data")
def all_data():

    # Define a list to jsonify
    complete_country_data = []

    for country_name in all_countries:
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # These are the columns we want for the graph. 
        want_columns = ['country', 'year', 'access_to_elec', 'elec_from_fossil', 'elec_from_renew',
                    'low_carbon_elec', 'co2_emissions', 'primary_energy_cons']

        # Query for the country and its data on the database
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.access_to_elec, Energy_table.elec_from_fossil,
        Energy_table.elec_from_renew, Energy_table.low_carbon_elec, Energy_table.co2_emissions,
        Energy_table.primary_energy_cons).filter(Energy_table.country == country_name).all()

        # Close the session
        session.close()

        # Create a dictionary to jsonify for the API
        country_data = {'country': country, 'year': {}}
        for row in results:
            # row[1] is the year
            country_data['year'][str(row[1])] = {}

            # We start at 2 as the first 2 elements of the list are the country name and the year
            for i in range(2,len(row)):
                country_data['year'][str(row[1])][want_columns[i]] = float(row[i])

        complete_country_data.append(country_data)

    return jsonify(complete_country_data)


# A route for all data for a chosen country
@app.route("/api/v1.0/country_data/<country_name>")
def country_all_data(country_name):

    # Create our session (link) from Python to the DB
    session = Session(engine)

    # These are the columns we want for the graph. 
    want_columns = ['country', 'year', 'access_to_elec', 'elec_from_fossil', 'elec_from_renew',
                 'low_carbon_elec', 'co2_emissions', 'primary_energy_cons']
    if country_name in all_countries:

        # Query for the country and its data on the database
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.access_to_elec, Energy_table.elec_from_fossil,
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
    else:
        # Close the session
        session.close()
        return jsonify({"Error": f"Country cannot be found. Try to use /api/v1.0/countries link for country names"}), 404


# A route to return the data for a chosen country and the column wanted
@app.route("/api/v1.0/country_data/<country_name>/<data>")
def country_data(country_name, data):

    # For access_to_elec column
    if (data == 'access_to_elec') and (country_name in all_countries):
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # Query the country name and the results for which data is chosen
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.access_to_elec).\
        filter(Energy_table.country == country_name).all()

        # Close the session
        session.close

        # Create a list of dictionaries to jsonify the data
        country_data = [{country: {'access_to_elec': {}}}]
        for row in results:
            country_data[0][country]['access_to_elec'][row[1]] = row[2]
        return jsonify(country_data)

    # For elec_from_fossil column
    elif (data == 'elec_from_fossil') and (country_name in all_countries):
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # Query the country name and the results for which data is chosen
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.elec_from_fossil).\
        filter(Energy_table.country == country_name).all()

        # Close the session
        session.close

        # Create a list of dictionaries to jsonify the data
        country_data = [{country: {'elec_from_fossil': {}}}]
        for row in results:
            country_data[0][country]['elec_from_fossil'][row[1]] = row[2]
        return jsonify(country_data)

    # For elec_from_new column
    elif (data == 'elec_from_renew') and (country_name in all_countries):
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # Query the country name and the results for which data is chosen
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.elec_from_renew).\
        filter(Energy_table.country == country_name).all()

        # Close the session
        session.close

        # Create a list of dictionaries to jsonify the data
        country_data = [{country: {'elec_from_renew': {}}}]
        for row in results:
            country_data[0][country]['elec_from_renew'][row[1]] = row[2]
        return jsonify(country_data)

    # For low_carbon_elec column
    elif (data == 'low_carbon_elec') and (country_name in all_countries):
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # Query the country name and the results for which data is chosen
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.low_carbon_elec).\
        filter(Energy_table.country == country_name).all()

        # Close the session
        session.close

        # Create a list of dictionaries to jsonify the data
        country_data = [{country: {'low_carbon_elec': {}}}]

        for row in results:
            country_data[0][country]['low_carbon_elec'][row[1]] = row[2]
        return jsonify(country_data)

    # For co2_emissions column
    elif (data == 'co2_emissions') and (country_name in all_countries):
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # Query the country name and the results for which data is chosen
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.co2_emissions).\
        filter(Energy_table.country == country_name).all()

        # Close the session
        session.close

        # Create a list of dictionaries to jsonify the data
        country_data = [{country: {'co2_emissions': {}}}]
        for row in results:
            country_data[0][country]['co2_emissions'][row[1]] = row[2]
        return jsonify(country_data)

    # For primary_energy_cons column
    elif (data == 'primary_energy_cons') and (country_name in all_countries):
        # Create our session (link) from Python to the DB
        session = Session(engine)

        # Query the country name and the results for which data is chosen
        country = session.query(Energy_table.country).filter(Energy_table.country == country_name).distinct().all()[0][0]
        results = session.query(Energy_table.country, Energy_table.year, Energy_table.primary_energy_cons).\
        filter(Energy_table.country == country_name).all()

        # Close the session
        session.close

        # Create a list of dictionaries to jsonify the data
        country_data = [{country: {'primary_energy_cons': {}}}]
        for row in results:
            country_data[0][country]['primary_energy_cons'][row[1]] = row[2]
        return jsonify(country_data)
    
    else:
        return jsonify({"Error": f"Country/data cannot be found. Try to use /api/v1.0/countries link for country names or \
                        the list in the main route for the data list"}), 404
    
if __name__ == "__main__":
    app.run(debug=True)