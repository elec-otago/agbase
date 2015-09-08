__author__ = 'mark'


class MeasurementCategory:

    def __init__(self, name, id=-1):
        self.name = name
        self.id = id


class Algorithm:

    def __init__(self, name, id=-1, category_id=-1):
        self.name = name
        self.id = id
        self.category_id = category_id


class User:

    def __init__(self, first_name, last_name, email, id=-1):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.id = id


class Role:

    def __init__(self, name, id=-1):
        self.name = name
        self.id = id


class Farm:

    def __init__(self, name, id=-1):
        self.name = name
        self.id = id


class Herd:

    def __init__(self, name, id=-1, farm_id=-1):
        self.name = name
        self.farm_id = farm_id
        self.id = id


class Measurement:

    def __init__(self):
        self.id = -1
        self.value1 = 0
        self.value2 = 0
        self.value3 = 0
        self.value4 = 0
        self.value5 = 0
        self.time_stamp = None
        self.comment = ""
        self.user_id = -1
        self.algorithm_id = -1
        self.animal_id = -1


    def init_with_json(self, json_measurement):
        self.id = json_measurement[u'id']
        self.value1 = json_measurement[u'value1']
        self.value2 = json_measurement[u'value2']
        self.value3 = json_measurement[u'value3']
        self.value4 = json_measurement[u'value4']
        self.value5 = json_measurement[u'value5']
        self.time_stamp = json_measurement[u'timeStamp']
        self.comment = json_measurement[u'comment']
        self.user_id = json_measurement[u'UserId']
        self.algorithm_id = json_measurement[u'AlgorithmId']
        self.animal_id = json_measurement[u'AnimalId']


class Animal:

    def __init__(self, id=-1, eid="", vid="", herd_id=-1, farm_id=-1):

        self.id = id
        self.eid = eid
        self.vid = vid
        self.herd_id = herd_id
        self.farm_id = farm_id