'''
_author__ =  JMcC, MM, MO'M 
__copyright__ = "Copyright (c) 2016"
__license__ = "All Rights Reserved"
__version__ = "1.0.0"
__maintainer__ = JMcC, MM, MO'M 
__status__ = "Complete"
'''

from flask import Flask
from flask import g
import json
import sqlite3
import pandas as pd

app = Flask(__name__, static_url_path='')

DATABASE = "bike_data.db"


def connect_to_database():
    '''Connects to an Sqlite3 database'''
    return sqlite3.connect(DATABASE)


def get_db():
    '''Checks for a DB connection. If not found, calls connect_to_database to establish connection'''
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db


@app.teardown_appcontext
def close_connection(exception):
    '''Closes DB connection'''
    db = getattr(g,'_database', None)
    if db is not None:
        db.close()


@app.route('/')
def root():
    '''Initialises HTML page'''
    return app.send_static_file('dublinBikes.html')


@app.route("/getinfo")
def get_info():
    '''Returns last 101 rows of DB, populating map with the most recent information'''
    cur = get_db().cursor()
    cur.execute("SELECT * FROM data ORDER by last_update DESC limit 101;")
    cols = [col[0] for col in cur.description]
    data = [dict(zip(cols, row)) for row in cur]
    return json.dumps(data)


@app.route("/week/<int:station_id>")
def get_station_occupancy_weekly(station_id):
    '''Returns the average bike/ stand availability of a given station over each day of the week'''
    conn = get_db()
    days = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun']
    df = pd.read_sql_query("SELECT * FROM data WHERE number = :number", conn, params={"number": station_id})
    df['last_update_date'] = pd.to_datetime(df.last_update, unit='ms')
    df.set_index('last_update_date', inplace=True)
    df['weekday'] = df.index.weekday
    mean_available_stands = df[['available_bike_stands', 'weekday']].groupby('weekday').mean().round()
    mean_available_bikes = df[['available_bikes', 'weekday']].groupby('weekday').mean().round()
    mean_available_stands.index = days
    mean_available_bikes.index = days
    return json.dumps([mean_available_bikes.to_dict(), mean_available_stands.to_dict()])

@app.route("/hour/<int:station_id>")
def get_station_occupancy_hourly(station_id):
    '''Returns the average hourly bike/ stand availability of a given station, averaged across all days of the week'''
    conn = get_db()
    hours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    df = pd.read_sql_query("select * from data where number = :number", conn, params={"number": station_id})
    df['last_update_date'] = pd.to_datetime(df.last_update, unit='ms')
    df.set_index('last_update_date', inplace=True)
    df['hour'] = df.index.hour
    mean_available_stands = df[['available_bike_stands', 'hour']].groupby('hour').mean().round()
    mean_available_bikes = df[['available_bikes', 'hour']].groupby('hour').mean().round()
    mean_available_stands.index = hours
    mean_available_bikes.index = hours
    return json.dumps([mean_available_bikes.to_dict(), mean_available_stands.to_dict()])

@app.route("/hour/<int:station_id>/<int:day_index>")
def get_station_occupancy_hourly_day(station_id, day_index):
    '''Returns the hourly bike/ stand availability of a given station, for a specified weekday'''
    conn = get_db()
    df = pd.read_sql_query("select * from data where number = :number", conn, params={"number": station_id})
    df['last_update_date'] = pd.to_datetime(df.last_update, unit='ms')
    df.set_index('last_update_date', inplace=True)
    df['weekday'] = df.index.weekday
    day = df[df['weekday']==day_index]
    hours = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',\
             '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    day['hour'] = day.index.hour
    day_stands = day[['available_bike_stands', 'hour']].groupby('hour').mean().round()
    day_bikes = day[['available_bikes', 'hour']].groupby('hour').mean().round()
    day_stands.index = hours
    day_bikes.index = hours

    return json.dumps([day_bikes.to_dict(), day_stands.to_dict()])

if __name__ == "__main__":
    app.run()