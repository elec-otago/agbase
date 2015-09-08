__author__ = 'mark'

class MeasurementList:

    def __init__(self, animal, algorithm, user):
        self.animal = animal
        self.algorithm = algorithm
        self.user = user
        self.measurements = []


    def add_measurement(self, time_stamp, value1, value2=None, value3=None, value4=None, value5=None, comment=None):

        measurement_details = {'timeStamp': time_stamp, 'value1': value1}

        if value2 is not None:
            measurement_details['value2'] = value2

        if value3 is not None:
            measurement_details['value3'] = value3

        if value4 is not None:
            measurement_details['value4'] = value4

        if value5 is not None:
            measurement_details['value5'] = value5

        if comment is not None:
            measurement_details['comment'] = comment

        self.measurements.append(measurement_details)


    def get_json(self):

        if len(self.measurements) <= 0:
            return None

        json_list = {'animalId': self.animal.id,
                     'algorithmId': self.algorithm.id,
                     'userId': self.user.id,
                     'measurements': self.measurements}

        return json_list