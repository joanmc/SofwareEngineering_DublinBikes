'''
_author__ =  JMcC, MM, MO'M 
__copyright__ = "Copyright (c) 2016"
__license__ = "All Rights Reserved"
__version__ = "1.0.0"
__maintainer__ = JMcC, MM, MO'M 
__status__ = "Complete"
'''
from src.DataRetrieval import DataRetrieval
from src.DatabaseQuery import DatabaseQuery

import sqlite3
import time

if __name__=='__main__':
    while True:
        # create DataRetrieval object
        dataObject = DataRetrieval() 
        # make a request to Dublin bikes API
        data = dataObject.makeRequest()
        # save data to text file 
        dataObject.saveToTxt(data)
        # save data to JSON file
        dataObject.saveToJSON(data)
        # load data from JSON file into a data frame
        dataset = dataObject.getDatasetFromJSON('bikedata.JSON')
        # create table in database to store data
        dataObject.createTable()
        # import data in dataframe to database table
        dataObject.dataEntry(dataset)
        time.sleep(300)
    
    # create database query object
    # query = DatabaseQuery()
    # query static data (returned in a dataframe)
    # print (query.StaticData())
    # query dynamic data (returned in a dataframe)
    # print (query.DynamicData())