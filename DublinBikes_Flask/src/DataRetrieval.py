'''
_author__ =  JMcC, MM, MO'M 
__copyright__ = "Copyright (c) 2016"
__license__ = "All Rights Reserved"
__version__ = "1.0.0"
__maintainer__ = JMcC, MM, MO'M 
__status__ = "Complete"
'''
import requests
import json
import sqlite3
import datetime

class DataRetrieval(object):
    '''
    classdocs
    '''


    def __init__(self):
        '''
        Constructor
        '''
        self.url ='https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=f91d39198c63d3943ad544d10ca26c91a92bb984'
    
    def makeRequest(self):
        data = requests.get(self.url).text
        return data
    
    def saveToTxt(self, dataset):
        with open("data.txt", "w") as file:
                file.write(dataset)
    
    def saveToJSON(self, dataset):
        with open("bikedata.json", 'w') as file:
                #file.write("bikedata = ")
                file.write(dataset)
    
    def getDatasetFromJSON(self, JSONfile):
        with open(JSONfile) as data_file:
            dataset = json.load(data_file)
        return dataset
    
    def createTable(self):
        '''Create table to store all data from request to Dublin Bikes API in bike_data.db'''
        # connect to database 'bike_data.db'       
        conn = sqlite3.connect('bike_data.db')
        # initialise cursor for database
        c = conn.cursor()
        c.execute('CREATE TABLE IF NOT EXISTS data (number INTEGER, name TEXT, address TEXT, position_lat REAL,\
         position_lng REAL, banking TEXT, bonus TEXT, status TEXT, contract_name TEXT, \
         bike_stands INTEGER, available_bike_stands INTEGER, available_bikes INTEGER, last_update REAL)')
        c.close
        conn.close()
    
        
    def dataEntry(self, dataset): 
        value = dataset[0]['last_update']  
        res = datetime.datetime.fromtimestamp(value/1000).strftime('%Y-%m-%d %H:%M:%S')
        
        for i in range(0,len(dataset)):
            dataset[i]['last_update'] = res
        
        # connect to database 'bike_data.db'       
        conn = sqlite3.connect('bike_data.db')
        # initialise cursor for database
        c = conn.cursor()
        for record in dataset:
            c.execute('INSERT INTO data VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', (record['number'],\
                            record['name'], record['address'], record['position']['lat'], record['position']['lng'], record['banking'], \
                            record['bonus'], record['status'], record['contract_name'], record['bike_stands'], record['available_bike_stands'], \
                            record['available_bikes'], record['last_update']))
            conn.commit()
        c.close
        conn.close()    