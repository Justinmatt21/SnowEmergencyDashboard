import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///static/db/snowemergency.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Parking = Base.classes.parking
Towing = Base.classes.towing
Snowfall = Base.classes.snowfall


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


@app.route("/emergency/<name>")
def emergency(name):
    #"""Return `otu_ids`, `otu_labels`,and `sample_values`."""
    stmt = db.session.query(Snowfall).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # Filter the data based on the sample number and
    # only keep rows with values above 1
    snowfall_data = df.loc[df['emergency']==name, ['Snowfall']]

    # Sort by sample
    #sample_data.sort_values(by=sample, ascending=False, inplace=True)

    # Format the data to send as json
    data = {
        "snowfall": snowfall_data.Snowfall.tolist()
    }
    return jsonify(data)

@app.route("/emergency_summary/<name>")
def emergency_summary(name):
    stmt_tow = db.session.query(Towing).statement
    towing_df = pd.read_sql_query(stmt_tow, db.session.bind)
    towing_data = towing_df.loc[towing_df['emergency']==name, ['emergency', 'date']]

    print("Check 1")

    stmt_parking = db.session.query(Parking).statement
    parking_df = pd.read_sql_query(stmt_parking, db.session.bind)
    parking_data = parking_df.loc[parking_df['emergency']==name,['emergency', 'date']]

    print("Check 2")

    stmt_snowfall = db.session.query(Snowfall).statement
    snowfall_df = pd.read_sql_query(stmt_snowfall, db.session.bind)
    snowfall_data = snowfall_df.loc[snowfall_df['emergency']==name,['emergency', 'date']]

    print("Check 3")

    data = {
        "towing_emergency" : towing_data.emergency.tolist(),
        "towing_date" : towing_data.date.tolist(),
        "parking_emergency" : parking_data.emergency.tolist(),
        "parking_date" : parking_data.date.tolist(),
        "snowfall_emergency" : snowfall_data.emergency.tolist(),
        "snowfall_date" : snowfall_data.date.tolist()    
    }

    return jsonify(data)


@app.route("/emergency_summaries")
def emergency_summaries():

    stmt_tow = db.session.query(Towing).statement
    towing_df = pd.read_sql_query(stmt_tow, db.session.bind)

    towing_emergencies = towing.df['emergency'].unique()
    
    towing_data = towing_df.loc[towing_df['emergency']==name, ['emergency', 'date']]

    print("Check 1")

    stmt_parking = db.session.query(Parking).statement
    parking_df = pd.read_sql_query(stmt_parking, db.session.bind)
    parking_data = parking_df.loc[parking_df['emergency']==name,['emergency', 'date']]

    print("Check 2")

    stmt_snowfall = db.session.query(Snowfall).statement
    snowfall_df = pd.read_sql_query(stmt_snowfall, db.session.bind)
    snowfall_data = snowfall_df.loc[snowfall_df['emergency']==name,['emergency', 'date']]

    print("Check 3")

    data = {
        "towing_emergency" : towing_data.emergency.tolist(),
        "towing_date" : towing_data.date.tolist(),
        "parking_emergency" : parking_data.emergency.tolist(),
        "parking_date" : parking_data.date.tolist(),
        "snowfall_emergency" : snowfall_data.emergency.tolist(),
        "snowfall_date" : snowfall_data.date.tolist()    
    }

    return jsonify(data)
if __name__ == "__main__":
    app.run()
