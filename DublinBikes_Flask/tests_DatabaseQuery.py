from src.DatabaseQuery import DatabaseQuery
from src.DataRetrieval import DataRetrieval

'''
_author__ =  JMcC, MM, MO'M 
__copyright__ = "Copyright (c) 2016"
__license__ = "All Rights Reserved"
__version__ = "1.0.0"
__maintainer__ = JMcC, MM, MO'M 
__status__ = "Complete"
'''

import numpy as np
import pandas as pd

def test_StaticData():
    ''' test StaticData in DatabaseQuery return the correct number of rows and columns'''
    query = DatabaseQuery()
    res = query.StaticData()
    assert res.shape == (101,7)

def test_DynamicData():
    ''' test DynamicData in DatabaseQuery return the correct number of rows and columns'''
    test = DatabaseQuery()
    res = test.DynamicData()
    assert len(res.columns) == 5
    