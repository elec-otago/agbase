import psycopg2
import pprint
import datetime
import math
from agbase.agbase import AgBase
from agbase.algorithm import AlgorithmAPI
from agbase.animal import AnimalAPI
from agbase.farm import FarmAPI
from agbase.herd import HerdAPI
from agbase.measurement import MeasurementAPI
from agbase.measurement_category import MeasurementCategoryAPI
__author__ = 'john'


class WeighBridgeEmulator:
    user = # 
    pwd = # 
    server = # 

    def __init__(self):
       
        # fill out dbname host etc in psycopg2.connect 
        self.conn = psycopg2.connect("dbname=<database_name> host=<database_host> user=<database_user> password=<database_password>")
        self.cur = self.conn.cursor()
        self.agbase = AgBase()
        self.algorithm = AlgorithmAPI(self.agbase)
        self.animal = AnimalAPI(self.agbase)
        self.farm = FarmAPI(self.agbase)
        self.herd = HerdAPI(self.agbase)
        self.measurement = MeasurementAPI(self.agbase)
        self.measurement_category = MeasurementCategoryAPI(self.agbase)
        self.agbase.set_logging_on(True)
        self.user = self.agbase.connect(self.user, self.pwd, self.server)
        self.pp = pprint.PrettyPrinter(indent=4)
        if self.user is None:
            print("login failed")
        farms = self.farm.get_farms(self.user)
        for farm in farms:
            if farm.name == "Demo Farm":
                self.frm = farm

        cats = self.measurement_category.get_measurement_categories()
        for cat in cats:
            if cat.name == "Weight":
                self.cat = cat

        algs = self.algorithm.get_algorithms(self.cat)
        for alg in algs:
            if alg.name == "bayesy_andy_constrained_prior":
                self.alg = alg

    def get_animal_list(self):
        query = "select a.id, a.eid from animal as a join animalfarm as af on(a.id = af.animal_id) where a.vid IS NULL;" #limit(500)
        self.cur.execute(query)
        return self.cur.fetchall()

    def get_Day(self, date, animalid):
        query = 'select * from weights where weights.animal_id = {animalid} and date <@ tsrange(\'{date}\', \'{date}\'::date + 1, \'[)\') and method_id = 70 and weighbridge_id = 8 order by DATE;'.format(animalid=animalid, date=date)
        self.cur.execute(query)
        return self.cur.fetchall()

    def clean_up(self):
        self.cur.close()
        self.conn.close()

    def create_measurements(self, animal, measurements):
        for measurement in measurements:
            if(not math.isnan(measurement[5]) or not math.isnan(measurement[6]) or not math.isnan(measurement[7])):
                self.measurement.create_measurement(animal, self.alg, self.user, str(measurement[4]), measurement[5], None, measurement[6], None, measurement[7], None)

    def upload_animal_measurements_by_day(self):
        date = datetime.date(2015, 01, 01) # sets date to first day of the year
        animals = self.get_animal_list() # get animal list from the local database
        animal_max = len(animals)
        self.pp.pprint(animals)        
        for i in range(0, 100):
            print "day: {}/100".format(i)
            animal_count = 0
            for animalID in animals:
                animal_count += 1
                print "animal {}/{}".format(animal_count, animal_max)
                animal = self.animal.get_animal_by_eid(self.frm, animalID[1])
                if(animal == None):
                    animal = self.animal.create_animal(self.frm, animalID[1]) # creates an animal if it dosnt exist
                measurements = self.get_Day(date, animalID[0]) # gets the days measurements for the above animals on the above day
                if(len(measurements) > 0): # check to see if there are any measurements on that day
                    self.create_measurements(animal, measurements)

            date += datetime.timedelta(days=1)

WBE = WeighBridgeEmulator()
WBE.upload_animal_measurements_by_day()
WBE.clean_up()
