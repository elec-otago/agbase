from mongo_models import Reading

import example_config as config
import string
import random
import decimal
import datetime

class ReadingFactory:

    PADDOCK_1            = 0
    PADDOCK_2            = 1
    PADDOCK_3            = 2
    PADDOCK_4            = 3

    POSITION_MOD         = 1000000

    LON_MIN_POS          = 0
    LON_MAX_POS          = 1
    LAT_MIN_POS          = 2
    LAT_MAX_POS          = 3

    def build_demo_reading(self, paddock_tag, paddock_oid, user_id, algo_id, create_timestamp, update_timestamp):

        length = random.randint(1, 26)
        location = self.get_demo_coords(paddock_tag)
        altitude = 1

        reading = Reading(paddock_oid, user_id, algo_id, length, location, altitude, create_timestamp, update_timestamp)

        return reading

    def build_reading(self, paddock_oid, user_id, algo_id, length, location, altitude, create_timestamp, update_timestamp):

        reading = Reading(paddock_oid, user_id, algo_id, length, location, altitude, create_timestamp, update_timestamp)

        return reading

    def get_demo_coords(self, paddock_tag):

        paddock_bounds = self.__get_bounds(paddock_tag)

        lon = self.__build_random_coord(paddock_bounds[self.LON_MIN_POS], paddock_bounds[self.LON_MAX_POS])
        lat = self.__build_random_coord(paddock_bounds[self.LAT_MIN_POS], paddock_bounds[self.LAT_MAX_POS])

        return [lon, lat]

    def __get_bounds(self, paddock_tag):

        return {
            self.PADDOCK_1: config.PADDOCK_1_BOUNDS,
            self.PADDOCK_2: config.PADDOCK_2_BOUNDS,
            self.PADDOCK_3: config.PADDOCK_3_BOUNDS,
            self.PADDOCK_4: config.PADDOCK_4_BOUNDS
        }.get(paddock_tag, None)

    def __build_random_coord(self, min, max):

        lower = min * self.POSITION_MOD
        upper = max * self.POSITION_MOD

        coord = decimal.Decimal(random.randrange(lower, upper, 1))/self.POSITION_MOD

        return coord
