'''
_author__ =  JMcC, MM, MO'M 
__copyright__ = "Copyright (c) 2016"
__license__ = "All Rights Reserved"
__version__ = "1.0.0"
__maintainer__ = JMcC, MM, MO'M 
__status__ = "Complete"
'''

import sqlite3
import pandas as pd 

class DatabaseQuery(object):
    '''
    Class to query the sqlite database and return the data requested in a dataframe
    '''

    def __init__(self):
        '''
        Constructor
        '''
        
    def StaticData(self):
        ''' Query the database and return static data for each station in a dataframe'''
        # connect to database
        conn = sqlite3.connect('bike_data.db')
        # initialise cursor for database
        c = conn.cursor()
        # select the static data and put it into a dataframe
        df = pd.read_sql_query("SELECT DISTINCT number, name, address, banking, position_lat, \
                        position_lng, contract_name FROM test", conn)
        c.close
        conn.close()
        return df
    
    def DynamicData(self):
        ''' Query the database and return dynamic data for each station in a dataframe'''
        # connect to database
        conn = sqlite3.connect('bike_data.db')
        # initialise cursor for database
        c = conn.cursor()
        # select the dynamic data for most recent update - WHERE time = most recent ??
        df = pd.read_sql_query("SELECT DISTINCT status, bike_stands, available_bike_stands, \
                    available_bikes, last_update FROM test", conn)
        c.close
        conn.close()
        return df