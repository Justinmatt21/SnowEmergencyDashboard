import os

import pandas as pd
import numpy as np
#import geojson
import datetime
from dateutil.parser import parse

import create_geojson

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
# I added
#from sqlalchemy import Integer, String, Text, Binary, Column

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
Episode = Base.classes.episodes
Bsnowfall = Base.classes.bsnowfall

METROCOUNTIES = ['HENNEPIN', 'RAMSEY', 'ANOKA', 'CARVER', 'DAKOTA', 'SCOTT', 'WRIGHT', 'SHERBURNE', 'ISANTI',\
                'WASHINGTON', 'CHISAGO']

def filter_by_dates(df, start_date, end_date, counties=METROCOUNTIES):
    """For each station, return the cumulative snowfall from start_date to end_date, inclusive"""
    
    #print("filtering")

    number_of_days = (end_date - start_date).days + 1 # since inclusive

    range_of_days = [start_date + datetime.timedelta(days=day) for day in range(number_of_days)]
    #print(range_of_days)

    #print("type of date", df.loc[1,'date'])

    df['date'] = [parse(date) for date in df['date']]

    #print("type of date", df.loc[1,'date'])
    
    time_cond = df['date'].isin(range_of_days)
    print("time cond", time_cond.any())

    county_cond = df['county'].isin(counties)
    #print("county_cond", county_cond.any())

    combined_cond = time_cond & county_cond
    #print("combined_cond", combined_cond.any())

    result = df[combined_cond]

    return result

def group_and_summarize_dataframe (df, grouping, stats):      
    # Create an empty dataframe to store the results.
    # print("grouping__________________________________________________")
    results_df = pd.DataFrame()
    grouped_df = df.groupby(grouping)
    for name, column, agg_func in stats:
        results_df[name] = grouped_df[column].agg(agg_func)
        
    return results_df.reset_index()

def metro_snowtotals_by_dates(df, start_date, end_date):
    
    # print("metro_snowtotals_by_dates______________________________________")
    # print(start_date)
    # print(end_date)

    filtered_df = filter_by_dates(df, start_date, end_date)
    # print(filtered_df)

    total_df = group_and_summarize_dataframe(filtered_df, 'station',\
                                           [('name', 'name', lambda x: x.unique()),\
                                            ('county', 'county', lambda x: x.unique()),\
                                            ('longitude', 'longitude', lambda x: x.unique()),\
                                            ('latitude', 'latitude',  lambda x: x.unique()),\
                                            ('snowtotal', 'snowfall', 'sum')])
    # print(total_df)

    return total_df

# The code below was not mine - the source is given below
# https://geoffboeing.com/2015/10/exporting-python-data-geojson/

#import geojson

def df_to_geojson(df, properties, lat='latitude', lon='longitude'):
    # print(df)
    geojson = {'type':'FeatureCollection', 'features':[]}
    for _, row in df.iterrows():
        feature = {'type':'Feature',
                   'properties':{},
                   'geometry':{'type':'Point',
                               'coordinates':[]}}
        feature['geometry']['coordinates'] = [row[lon],row[lat]]
        for prop in properties:
            feature['properties'][prop] = row[prop]
        geojson['features'].append(feature)

    # print(geojson)

    return jsonify(geojson)


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/snowgeojson/<name>")
def snowgeojson(name):
    stmt = db.session.query(Episode).statement
    df = pd.read_sql_query(stmt, db.session.bind)
    # print(df)

    emergency_df = df[ df['emergency'] == name ]
    
    # print(emergency_df)

    stmt = db.session.query(Bsnowfall).statement
    snow_df = pd.read_sql_query(stmt, db.session.bind)

    # print(snow_df)

    start_date = emergency_df.storm_begin_date.tolist()[0]
    print("start_date", start_date, "is of type: ", type(start_date))

    end_date  = emergency_df.declaration_date.tolist()[0]
    
    start_date = parse(start_date)
    print("start_date", start_date, "is of type: ", type(start_date))

    end_date = parse(end_date)
    
    snow_amounts_df = metro_snowtotals_by_dates(snow_df, start_date, end_date)

    # print(snow_amounts_df)

    return df_to_geojson(snow_amounts_df, ['station', 'name', 'snowtotal'])

@app.route("/episode/<name>")
def episode(name):
    stmt = db.session.query(Episode).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    print(name)
    # Filter the data based on the sample number and
    # only keep rows with values above 1
    episode_data = df.loc[df['emergency']==name, ['narrative']]

    # Sort by sample
    #sample_data.sort_values(by=sample, ascending=False, inplace=True)

    # Format the data to send as json
    data = {
        "narrative": episode_data.narrative.tolist()
    }

    # print(data)
    return jsonify(data)

@app.route("/episode_satellite/<name>")
def episode_satellite(name):
    stmt = db.session.query(Episode).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    # print("In episode_satellite")
    # Filter the data based on the sample number and
    # only keep rows with values above 1
    episode_data = df.loc[df['emergency']==name, ['gif_url']]

    # Sort by sample
    #sample_data.sort_values(by=sample, ascending=False, inplace=True)

    # Format the data to send as json
    data = {
        "gif_url": episode_data.gif_url.tolist()
    }

    # print(data)
    return jsonify(data)

@app.route("/towing/<name>")
def towing(name):
    stmt_tow = db.session.query(Towing).statement
    towing_df = pd.read_sql_query(stmt_tow, db.session.bind)
    towing_data = towing_df.loc[towing_df['emergency']==name, ['longitude', 'latitude']]

    data = {
        "longitude" : towing_data.longitude.tolist(),
        "latitude" : towing_data.latitude.tolist(),
     }

    return jsonify(data)


@app.route("/emergency_summary/<name>")
def emergency_summary(name):
    stmt_tow = db.session.query(Towing).statement
    towing_df = pd.read_sql_query(stmt_tow, db.session.bind)
    towing_data = towing_df.loc[towing_df['emergency']==name, ['emergency', 'date']]

    #print("Check 1")

    stmt_parking = db.session.query(Parking).statement
    parking_df = pd.read_sql_query(stmt_parking, db.session.bind)
    parking_data = parking_df.loc[parking_df['emergency']==name,['emergency', 'date']]

    #print("Check 2")

    stmt_snowfall = db.session.query(Snowfall).statement
    snowfall_df = pd.read_sql_query(stmt_snowfall, db.session.bind)
    snowfall_data = snowfall_df.loc[snowfall_df['emergency']==name,['emergency', 'date']]

    #print("Check 3")

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

    # Get total number of tows per emergency

    stmt_tow = db.session.query(Towing).statement
    towing_df = pd.read_sql_query(stmt_tow, db.session.bind)

    towcounts = towing_df.groupby(['emergency'])['emergency'].agg('count')
    
    # Get total number of tickets

    stmt_parking = db.session.query(Parking).statement
    parking_df = pd.read_sql_query(stmt_parking, db.session.bind)

    parkingcounts = parking_df.groupby(['emergency'])['emergency'].agg('count')
    
    # Get average snowfall amounts for each emergency

    stmt_snowfall = db.session.query(Snowfall).statement
    snowfall_df = pd.read_sql_query(stmt_snowfall, db.session.bind)
    snowfallaverage = snowfall_df.groupby(['emergency'])['Snowfall'].agg('mean')


    print("Check 3")

    data = {
        "emergency" : towcounts.index.tolist(),
        "tows" : towcounts.tolist(),
        "parking" : parkingcounts.tolist(),
        "snowfall" : snowfallaverage.tolist()
    }

    return jsonify(data)

@app.route("/sqlBubble")
def buildBubble():

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///static/db/snowemergency.sqlite"
    db = SQLAlchemy(app)

    Base = automap_base()

    Base.prepare(db.engine, reflect=True)

    Parking = Base.classes.parking
    Towing = Base.classes.towing

    stmt = db.session.query(Parking).statement
    parking_df = pd.read_sql_query(stmt, db.session.bind)



    from datetime import datetime
    dates = parking_df["date"]

    #yearList = []

    #for date in dates:
        #objDate = datetime.strptime(date, '%m/%d/%y')
        #objYear = datetime.strftime(objDate,'%Y')
        #yearList.append(objYear)
        
    #yearSeries = pd.Series(yearList)
    import datetime
    from dateutil.parser import parse

    def convert_dates(dates):
        def try_to_parse_date (a_string):
            try:
                parsed = parse(a_string, fuzzy_with_tokens=True)
            except ValueError:
                print(f"Could not parse a date from `{a_string}`")
            else:
                return parsed[0]

        def converter(date):
            if isinstance(date, datetime.datetime):
                return date
            else:
                return try_to_parse_date(date)

        return [converter(date) for date in dates]

    new_dates = convert_dates(dates)
    new_dates = [date.year for date in new_dates]

    parking_df['Year'] = new_dates
    #parking_df['Year'] = yearSeries

    year_grouped_df = parking_df.groupby(["Year"])["index"].count()

    parking_df.groupby(["Year", "emergency"]).count()
    parking_df["emergency"].count()

    emergency_per_year = parking_df.groupby(["Year"])["emergency"].nunique()
    emergency_per_year = pd.DataFrame(emergency_per_year)

    year_grouped_df = parking_df.groupby("Year")["index"].count()
    year_grouped_df = pd.DataFrame(year_grouped_df)

    merged_df = year_grouped_df.merge(emergency_per_year, on="Year")
    merged_df["tickets_per_emergency"] = round(merged_df["index"]/merged_df["emergency"])
    merged_df = merged_df.reset_index()
    merged_df = merged_df.sort_values(by=["Year"])
    merged_df =  merged_df.rename(columns={"index": "ticket_count"})



    stmt = db.session.query(Towing).statement
    towing_df = pd.read_sql_query(stmt, db.session.bind)

    dates = towing_df["date"]

    #yearList = []

    #for date in dates:
        #objDate = datetime.strptime(date, '%m/%d/%y')
        #objYear = datetime.strftime(objDate,'%Y')
        #yearList.append(objYear)
        
    #yearSeries = pd.Series(yearList)

    #towing_df['Year'] = yearSeries

    new_dates = convert_dates(dates)
    new_dates = [date.year for date in new_dates]
    

    towing_df['Year'] = new_dates

    year_grouped_towing_df = towing_df.groupby("Year")["index"].count()
    year_grouped_towing_df = pd.DataFrame(year_grouped_towing_df)

    merged_towing_df = year_grouped_towing_df.merge(emergency_per_year, on="Year")
    merged_towing_df["tows_per_emergency"] = round(merged_towing_df["index"]/merged_towing_df["emergency"])

    merged_towing_df =  merged_towing_df.rename(columns={"index": "towing_count"})
    merged_towing_df = merged_towing_df.reset_index()

    both_df = merged_towing_df.merge(merged_df, on="Year")
    both_df = both_df.drop(['emergency_x'], axis=1, errors="ignore")
    both_df =  both_df.rename(columns={"emergency_y": "emergency_count"})
    both_df = both_df.drop(index=4, errors="ignore")

    year_list = both_df.Year.values.tolist()
    tows_list = both_df.tows_per_emergency.values.tolist()
    tickets_list = both_df.tickets_per_emergency.values.tolist()

    towing_expenses = [4924231, 5161377, 5161204, 5823201]
    towing_revenue = [4661269, 5254191, 4185881, 5125000]
    towing_revenue_less_expenses = [-262962, 92813, -975322, -698201]

    data = {
        "year": year_list,
        "tows": tows_list,
        "tickets": tickets_list,
        "towing expenses": towing_expenses,
        "towing_revenue": towing_revenue,
        "towing revenue less expenses": towing_revenue_less_expenses
    }

    return jsonify(data)






if __name__ == "__main__":
    app.run()
