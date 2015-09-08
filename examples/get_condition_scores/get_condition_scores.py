import datetime
import math
import json
import argparse
from agbase.agbase import AgBase
from agbase.algorithm import AlgorithmAPI
from agbase.animal import AnimalAPI
from agbase.farm import FarmAPI
from agbase.herd import HerdAPI
from agbase.measurement import MeasurementAPI
from agbase.measurement_category import MeasurementCategoryAPI
__author__ = 'john'

class getConditionScores:
    def __init__(self):
        parser = argparse.ArgumentParser()
        parser.add_argument('--user', required=True, help="AgBase Username")
        parser.add_argument('--password', required=True, help="AgBase Password")
        #parser.add_argument('--firstDate', required=True, help="First date of the measurements you wish to upload (YYYY/MM/DD)")
        #parser.add_argument('--lastDate', required=True, help="Last date of the measurements you wish to upload (YYYY/MM/DD)")
        parser.add_argument('--server', required=True, help="AgBase Server")
        
        args = parser.parse_args() 
        self.agbase = AgBase()
        self.algorithm = AlgorithmAPI(self.agbase)
        self.animal = AnimalAPI(self.agbase)
        self.farm = FarmAPI(self.agbase)
        self.herd = HerdAPI(self.agbase)
        self.measurement = MeasurementAPI(self.agbase)
        self.measurement_category = MeasurementCategoryAPI(self.agbase)
        self.agbase.set_logging_on(True)
        self.user = self.agbase.connect(args.user, args.password , args.server)
        #self.first_date = self.getDate(args.firstDate)
        #self.last_date = self.getDate(args.lastDate)

    def getScores(self):
        self.alg = self.algorithm.get_algorithm("DairyNZ BCS")        
        self.frm = self.farm.get_farm_by_name(self.user,"Demo Farm")
        animalList = []
        moreAnimals = True
        offset = 0
        limit = 500
        while moreAnimals is True: # amimals # more comlicated because there are more then the 1024 limit
            tempAnimalList = self.animal.get_animals(self.frm, None, limit, offset)
            if(len(tempAnimalList) != (limit+offset)):
                moreAnimals = False
            
            offset += limit    
            
            for animal in tempAnimalList:
                animalList.append(animal)
            
        measurementList = {}  # holds all of the measurements indexed by eid
        length = len(animalList)
        count = 0
        for animal in animalList: # goes through the animal list and sends a query to the datebase
            print "Animal {}/{}".format(count, length)
            count += 1
            measurementList[animal.eid] = self.measurement.get_measurements_for_animal(animal,self.alg)
        
        count = 0
        
        for animal in animalList:
            print "Animal {}/{}".format(count, length)
            count += 1
            for measurement in measurementList[animal.eid]:
                print "eid: {}, condition score:  {}, timestamp: {}".format(animal.eid,measurement.w50,measurement.time_stamp)

    def getDate(self, raw_date):
        date_parts = raw_date.split('/',2)
        if(len(date_parts) == 3):
            date = datetime.date(int(date_parts[0]),int(date_parts[1]),int(date_parts[2]))
            print 'date: ', date
            return int((date-datetime.date(1970,1,1)).total_seconds() * 1000)
        return None

c = getConditionScores()
c.getScores()
