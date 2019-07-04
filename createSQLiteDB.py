import os
import csv
import pandas as pd
import sqlite3
from sqlite3 import Error
 
def create_connection(db_file):
    """ create a database connection to a SQLite database """
    try:
        conn = sqlite3.connect(db_file)
        print(sqlite3.version)
        return conn
    except Error as e:
        print(e)
    finally:
        conn.close()
 
if __name__ == '__main__':
    create_connection("static/db/snowemergency.sqlite")


low_memory = False

# load data
parking_df = pd.read_csv("static/data/finalParking.csv")
towing_df = pd.read_csv("static/data/finalTowing.csv")
snowfall_df = pd.read_csv("static/data/final_snowfall_and_tows.csv")

# strip whitespace from headers
parking_df.columns = parking_df.columns.str.strip()
towing_df.columns = towing_df.columns.str.strip()
snowfall_df.columns = snowfall_df.columns.str.strip()

conn = sqlite3.connect("static/db/snowemergency.sqlite")

# drop data into database
parking_df.to_sql("parking", conn)
towing_df.to_sql("towing", conn)
snowfall_df.to_sql("snowfall", conn)

conn.close()