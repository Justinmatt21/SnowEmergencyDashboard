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
    create_connection("//Users//xantar//Desktop//Project2//db//snowemergency.db")


low_memory = False

# load data
parking_df = pd.read_csv('../ForDBParking.csv')
towing_df = pd.read_csv("../ForDBTowing.csv")

# strip whitespace from headers
parking_df.columns = parking_df.columns.str.strip()
towing_df.columns = towing_df.columns.str.strip()

conn = sqlite3.connect("../db/snowemergency.db")

# drop data into database
parking_df.to_sql("parking", conn)
towing_df.to_sql("towing", conn)

conn.close()