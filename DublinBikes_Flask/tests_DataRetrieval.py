from src.DataRetrieval import DataRetrieval

'''
_author__ =  JMcC, MM, MO'M 
__copyright__ = "Copyright (c) 2016"
__license__ = "All Rights Reserved"
__version__ = "1.0.0"
__maintainer__ = JMcC, MM, MO'M 
__status__ = "Complete"
'''

import sqlite3

def test_makeRequest():
    ''' test that the data return contains the required information'''
    data = DataRetrieval()
    res = data.makeRequest()
    if all (k in res for k in ("number","name","address","position","banking", "bonus","status","contract_name","bike_stands","available_bike_stands","available_bikes","last_update")):
        test = True
    else:
        test = False
    assert test == True

def test_createTable():
    '''test table exists in database'''
    # connect to database
    conn = sqlite3.connect('bike_data.db')
    # initialise cursor for database
    c = conn.cursor()
    tb_exists = ("SELECT name FROM sqlite_master WHERE type='table' AND name='test'")
    if (c.execute(tb_exists).fetchone()):
        res = True
    else:
        res = False
    c.close()
    conn.close()
    assert res == True


def test_dataEntry():
    '''test to check the table contains some data'''
    # connect to database
    conn = sqlite3.connect('bike_data.db')
    # initialise cursor for database
    c = conn.cursor()
    exist = c.fetchone()
    if exist!=0:
        res = True
    else:
        res = False
    assert res == True