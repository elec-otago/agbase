from mongo_models import *
from paddock_factory import PaddockFactory
from reading_factory import ReadingFactory
from weather_factory import WeatherFactory
from mooglePy.moogle import Moogle

import datetime
from dateutil import rrule
import json
import sys

class Main:
  
    FARMS_ENDPOINT      = 'farms'
    CAT_ENDPOINT        = 'measurement-categories'
    PADDOCK_ENDPOINT    = 'spatial/paddock/'
    READING_ENDPOINT    = 'spatial/reading'
    WEATHER_ENDPOINT    = 'spatial/weather'
    
    
    FARMS_PARAMS        = 'name=Demo%20Farm'
    CAT_PARAMS          = 'include=algorithms'

    TEST_EMAIL          = "<admin account email>"
    TEST_PASSWORD       = "<password>"

    PASTURE_CAT         = "Pasture Length"      # pasture measurement category
    WEATHER_CAT         = "Weather"             # weather measurement category
    
    CATEGORY_ALGO       = "Demo Algorithm"      # algorithm for weather and pasture measurement
    
    WEATHER_STATION_LOC =  [0, 0]

    def __init__(self):
     
        self.api = Moogle()

        url_address = sys.argv[1]

        self.api.connect(self.TEST_EMAIL, self.TEST_PASSWORD, url_address)
        
    ## Creates 4 example paddocks, each containing 100 pasture readings.
    def create_samples(self):  
          
        # Create weather measurements
        self.create_weather_measurements()
        
        # Get the id from the demo farm.
        demo_farm_id = self.get_farm_id()

        # Get factories
        p_factory = PaddockFactory()
        r_factory = ReadingFactory()

        algo_id = self.get_algorithm_id(self.PASTURE_CAT, self.CATEGORY_ALGO)

        # For loop used to create sample paddocks.
        for p_id in range(0, 4):

	        # Create an upload and update time.
            create_time = datetime.datetime.now()
            update_time = datetime.datetime.now() + datetime.timedelta(hours=1)

	        # Create a sample paddock.
            paddock = p_factory.build_demo_paddock(  
	            demo_farm_id,
                p_id,
                create_time, 
	            create_time if p_id < 2 else update_time)
            
            paddock.set_id(p_id)
 
            # Call API.
            paddock_res = self.api._Moogle__api_call('post', self.PADDOCK_ENDPOINT, paddock.to_dict(), None)
            
            # :Add the returned object id to the current paddock object.
            paddock_json = json.loads(paddock_res.text)
            paddock.set_oid(paddock_json['data']['_id'])

            # For loop used to create sample readings for the current paddock.
            for r_id in range(0, 100):

                # Create an upload and update time.
                create_time = datetime.datetime.now()
                update_time = datetime.datetime.now() + datetime.timedelta(hours=1)

                # Create a sample pasture reading.
                reading = r_factory.build_demo_reading( 
                  p_id,
                  paddock.oid,
                  -1,
                  algo_id,
                  create_time,
                  create_time if r_id % 4 != 0 else update_time)

                # Call API.
                self.api._Moogle__api_call('post', self.READING_ENDPOINT, reading.to_dict(), None)

    def create_weather_measurements(self):

        demo_farm_id = self.get_farm_id()
        algo_id = self.get_algorithm_id(self.WEATHER_CAT, self.CATEGORY_ALGO)
        if algo_id == -1:
            return False
        
        w_factory = WeatherFactory()
        
        end_date = datetime.datetime.now()
        start_date = end_date - datetime.timedelta(days=1)

        for time_stamp in rrule.rrule(rrule.MINUTELY, dtstart=start_date, until=end_date):
            w = w_factory.build_demo_weather(demo_farm_id, time_stamp, self.WEATHER_STATION_LOC, algo_id)
            res = self.api._Moogle__api_call('post', self.WEATHER_ENDPOINT, w.to_dict(), None)

    # Returns the demo farm primary key.
    def get_farm_id(self):
        farms = self.api._Moogle__api_call('get', self.FARMS_ENDPOINT, None, self.FARMS_PARAMS)
        farms = json.loads(farms.text)
        demo_farm_id = -1

        for farm in farms['farms']:
            if farm['name'] == 'Demo Farm':
                demo_farm_id = farm['id']

        return demo_farm_id

    # Returns the alogrithm id used for demo data 
    def get_algorithm_id(self, category, algorithm):

        algo_id = -1

        categories = self.api._Moogle__api_call('get', self.CAT_ENDPOINT, None, self.CAT_PARAMS)
        categories = json.loads(categories.text)
        
        for c in categories['categories']:
            if c['name'] == category:
                for a in c['algorithms']:                    
                    if a['name'] == algorithm: 
                        algo_id = a['id']
            
        return algo_id

m = Main()
m.create_samples()
