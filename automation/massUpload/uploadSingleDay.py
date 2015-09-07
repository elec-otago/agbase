import psycopg2
import pprint
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


class WeighBridgeEmulator:
    def __init__(self):
        parser = argparse.ArgumentParser()
        parser.add_argument('--user', required=True, help="AgBase Username")
        parser.add_argument('--passwd', required=True, help="AgBase Password")
        parser.add_argument('--date', required=True, help="Date of the measurements you wish to upload (YYYY:MM:DD)")
        parser.add_argument('--server', default="<website_address>", help="AgBase Server")
        
        args = parser.parse_args()        
        self.conn = psycopg2.connect("dbname=<database_name> host=<database_address> user=<database_user> password=<database_password>")
        self.cur = self.conn.cursor()
        self.agbase = AgBase()
        self.algorithm = AlgorithmAPI(self.agbase)
        self.animal = AnimalAPI(self.agbase)
        self.farm = FarmAPI(self.agbase)
        self.herd = HerdAPI(self.agbase)
        self.measurement = MeasurementAPI(self.agbase)
        self.measurement_category = MeasurementCategoryAPI(self.agbase)
        self.agbase.set_logging_on(True)
        self.user = self.agbase.connect(args.user, args.passwd , args.server)
        self.pp = pprint.PrettyPrinter(indent=4)
        datearr = args.date.split(':',2)
        print datearr[0], datearr[1], datearr[2]
        self.date = datetime.date(int(datearr[0]), int(datearr[1]), int(datearr[2]))
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
            if alg.name == "bayesy_andy_constrained_prior": # need to change alg id in get_Day function
                self.alg = alg

    def get_animal_list(self):
        query = "select a.id, a.eid from animal as a join animalfarm as af on(a.id = af.animal_id) where a.vid IS NULL;" #limit(500)
        self.cur.execute(query)
        return self.cur.fetchall()

    def get_Day(self, date, animalid):
        query = 'select * from weights where weights.animal_id = {animalid} and date <@ tsrange(\'{date}\'::date - 1, \'{date}\', \'[)\') and method_id = 70 and weighbridge_id = 8 order by DATE;'.format(animalid=animalid, date=date)
        self.cur.execute(query)
        return self.cur.fetchall()

    def clean_up(self):
        self.cur.close()
        self.conn.close()

    def upload_animal_measurements_by_day(self):
        animals = self.get_animal_list() # get animal list from the local database
        animal_max = len(animals)
        self.pp.pprint(animals)
        listIndex = 0
        self.meas_list = []
        self.meas_list.append(self.measurement.create_bulk_measurement_upload_list(self.alg,self.user,None,self.frm.id))

        animal_count = 0
        for animalID in animals:
            animal_count += 1
            print "animal {}/{}".format(animal_count, animal_max)
            measurements = self.get_Day(self.date, animalID[0]) # gets the days measurements for the above animals on the above day
            if(len(measurements) > 0): # check to see if there are any measurements on that day
                for measurement in measurements:
                    if(self.meas_list[listIndex].get_measurement_count() >= 500):
                        self.agbase.log("meas_list Dump >>> " + json.dumps(self.meas_list[listIndex].get_json()))
                        listIndex += 1
                        self.meas_list.append(self.measurement.create_bulk_measurement_upload_list(self.alg,self.user,None,self.frm.id))
                        
                    if(not math.isnan(measurement[5]) or not math.isnan(measurement[6]) or not math.isnan(measurement[7])):
                        self.meas_list[listIndex].add_measurement(str(measurement[4]), measurement[5], None, measurement[6], None, measurement[7], animalID[1])

        for measurementList in self.meas_list:
            self.measurement.upload_measurement_list(measurementList)

        self.meas_list = []
        listIndex = 0
        self.meas_list.append(self.measurement.create_bulk_measurement_upload_list(self.alg,self.user,None,self.frm.id))

WBE = WeighBridgeEmulator()
WBE.upload_animal_measurements_by_day()
WBE.clean_up()
