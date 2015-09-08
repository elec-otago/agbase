from mongo_models import *
from reading_factory import ReadingFactory
from mooglePy.moogle import Moogle

import datetime
import json

class Main:
   
    NUM_PASTURE_READINGS = 25

    FARMS_ENDPOINT       = 'farms'
    PADDOCK_ENDPOINT     = 'spatial/paddock'
    READING_ENDPOINT     = 'spatial/reading'

    FARMS_PARAMS         = 'name=Demo%20Farm' # Replace Demo Farm if using a farm with a different name.
    PADDOCKS_PARAMS      = 'farm_id='

    TEST_EMAIL           = "<admin account name>"
    TEST_PASSWORD        = "<password>"

    def __init__(self):

        self.api = Moogle()
        self.api.connect(self.TEST_EMAIL, self.TEST_PASSWORD)

    def add_readings(self):

        # Get demo farm id
        demo_farm_id = self.get_farm_id()

        # Get the user id from the logged in user
        res = self.api._Moogle__api_call('get', 'auth', None, None)
        user = json.loads(res.text)
        user_id = user['user']['id']

        # Get pasture reading factory
        r_factory = ReadingFactory()

        # Get timestamp 
        timestamp = datetime.datetime.now()

        # Get each paddock that belongs to the demo farm
        paddock_params = self.PADDOCKS_PARAMS + str(demo_farm_id)
        response = self.api._Moogle__api_call('get', self.PADDOCK_ENDPOINT, None, paddock_params)
        paddocks = json.loads(response.text)
        paddocks = paddocks['paddocks']
       
        # Iterate through each paddock in the farm
        for paddock in paddocks:

            paddock_oid = paddock['_id']
            paddock_id  = paddock['id']

            # Create a pasture reading for each farm.
            for i in range(0, self.NUM_PASTURE_READINGS):

                # Create a sample pasture reading.
                reading = r_factory.build_demo_reading( 
                  paddock_id,
                  paddock_oid,
                  user_id,
                  timestamp,
                  timestamp)


                # Call API.
                self.api._Moogle__api_call('post', self.READING_ENDPOINT, reading.to_dict(), None)

    ## Returns the demo farm primary key.
    def get_farm_id(self):
        farms = self.api._Moogle__api_call('get', self.FARMS_ENDPOINT, None, self.FARMS_PARAMS)
        farms = json.loads(farms.text)
        return farms['farms'][0]['id']

m = Main()
m.add_readings()
