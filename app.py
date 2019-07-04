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



@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")



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