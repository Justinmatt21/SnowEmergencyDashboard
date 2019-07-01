import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template

app = Flask(__name__)



@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")



if __name__ == "__main__":
    app.run()