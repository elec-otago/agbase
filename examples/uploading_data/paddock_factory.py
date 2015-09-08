from mongo_models import Paddock

import example_config as config
import string
import datetime

class PaddockFactory:

    PADDOCK_1 = 0
    PADDOCK_2 = 1
    PADDOCK_3 = 2
    PADDOCK_4 = 3

    PADDOCK_1_NAME = "Paddock 1"
    PADDOCK_2_NAME = "Paddock 2"
    PADDOCK_3_NAME = "Paddock 3"
    PADDOCK_4_NAME = "Paddock 4"

    def build_demo_paddock(self, farm_id, paddock_tag, create_timestamp, update_timestamp):

        name = self.__get_demo_name(paddock_tag)
        coordinates = self.__get_demo_coords(paddock_tag)
        paddock = Paddock(farm_id, name, create_timestamp, update_timestamp, coordinates)

        return paddock

    def build_paddock(self, name, farm_id, create_timestamp, update_timestamp, coordinates):

        paddock = Paddock(farm_id, name, create_timestamp, update_timestamp, coordinates)

        return paddock

    def __get_demo_name(self, paddock_tag):

        return {
            self.PADDOCK_1: self.PADDOCK_1_NAME,
            self.PADDOCK_2: self.PADDOCK_2_NAME,
            self.PADDOCK_3: self.PADDOCK_3_NAME,
            self.PADDOCK_4: self.PADDOCK_4_NAME
        }.get(paddock_tag, None)


    def __get_demo_coords(self, paddock_tag):

        return {
            self.PADDOCK_1: config.PADDOCK_1_BORDER,
            self.PADDOCK_2: config.PADDOCK_2_BORDER,
            self.PADDOCK_3: config.PADDOCK_3_BORDER,
            self.PADDOCK_4: config.PADDOCK_4_BORDER
        }.get(paddock_tag, None)
