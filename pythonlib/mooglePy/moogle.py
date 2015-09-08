import mooglePy.moogle_config as config
from mooglePy.models import *
from mooglePy.measurement_list import *

import requests
import json
import datetime
import urllib
import os

if os.getenv('MOOGLE_RUNNING_UNIT_TESTS', '0') == '1':
    # disable warnings about unverified https connections
    requests.packages.urllib3.disable_warnings()

__author__ = 'mark'


class Moogle:
    def __init__(self):
        self.mooogle_ip_address = None
        self.currentUser = ""
        self.currentPwd = ""
        self.session = requests.Session()
        self.session.headers.update({'content-type': 'application/json'})
        self.session.verify = config.defaultSigning
        self.authenticationTime = 0
        self.logging = False


    def __mooogle_log(self, string):
        if self.logging is True:
            print("-- Moogle: {}".format(string))


    def __api_call(self, http_verb, route, data=None, query_params=None):

        self.__mooogle_log("API call of type {} to {}".format(http_verb,route))

        authenticated = True

        expiry_time = self.authenticationTime + datetime.timedelta(minutes=config.token_time_out)

        if self.authenticationTime == 0 or datetime.datetime.now() > expiry_time:

            if self.authenticationTime != 0:
                self.__mooogle_log('Token Expired - reauthenticating')

            authenticated = self.__auth_user(self.currentUser, self.currentPwd)

        if not authenticated:
            return 0

        http_call = getattr(self.session, http_verb)

        if data is None and query_params is None:
            response = http_call(self.mooogle_ip_address + route)
        elif data is None and query_params is not None:
            response = http_call(self.mooogle_ip_address + route, params=query_params)
        elif query_params is None and data is not None:
            response = http_call(self.mooogle_ip_address + route, data=json.dumps(data))
        else:
            response = http_call(self.mooogle_ip_address + route, params=query_params, data=json.dumps(data))

        if response.status_code is not 200:
            print response.content

        return response


    def __auth_user(self, email, pwd):

        self.__mooogle_log("Authenticating User")

        user_details = {"email": email, "password": pwd}

        post_response = self.session.post(self.mooogle_ip_address + "auth/", data=json.dumps(user_details))

        if post_response.status_code != 200:
            self.__mooogle_log("Authentication Failed!")
            return None

        json_response = post_response.json()

        self.session.headers.update({'Authorization': 'Bearer ' + json_response[u'token']})

        self.authenticationTime = datetime.datetime.now()

        json_user = json_response[u'user']

        self.__mooogle_log("Authenticated user {}!".format(json_user[u'email']))

        return User(json_user[u'firstName'], json_user[u'lastName'], json_user[u'email'], json_user[u'id'])


    def connect(self, email, pwd, mooogle_ip):
        self.currentUser = email
        self.currentPwd = pwd
        self.mooogle_ip_address = mooogle_ip

        return self.__auth_user(email, pwd)


    def set_logging_on(self, is_on):
        self.logging = is_on

        if is_on is True:
            self.__mooogle_log("Moogle Logging Enabled!")


    def create_farm(self, name):
        result = self.__api_call('post', 'farms/', {'name': name})

        if result.status_code != 200:
            return None

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        json_farm = json_response[u'farm']

        return Farm(json_farm[u'name'], json_farm[u'id'])


    def remove_farm(self, farm):
        result = self.__api_call('delete', 'farms/{}'.format(farm.id))

        self.__mooogle_log(result.json()[u'message'])

        if result.status_code != 200:
            return False

        return True


    def get_farms(self, user=None):

        params = None

        if user is not None:
            params = {'user': user.id}

        result = self.__api_call('get','farms/', None, params )

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_farms = json_response[u'farms']

        farms = []

        for json_farm in json_farms:
            farms.append(Farm(json_farm[u'name'], json_farm[u'id']))

        return farms


    def get_farm(self, farmId):
        result = self.__api_call('get', 'farms/{}'.format(farmId))

        if result.status_code != 200:
            return None

        json_farm = result.json()[u'farm']

        return Farm(json_farm[u'name'], json_farm[u'id'])


    def create_herd(self, farm, name):
        result = self.__api_call('post', 'herds/', {'name': name, 'farmId': farm.id})

        if result.status_code != 200:
            return None

        self.__mooogle_log(result.json()[u'message'])

        json_response = result.json()[u'herd']

        return Herd(json_response[u'name'], json_response[u'id'], json_response[u'FarmId'])


    def remove_herd(self, herd):
        result = self.__api_call('delete','herds/{}'.format(herd.id))

        self.__mooogle_log(result.json()[u'message'])

        if result.status_code != 200:
            return False

        return True


    def get_herds(self, farm=None):

        params = None

        if farm is not None:
            params = {'farm': farm.id}

        result = self.__api_call('get', 'herds/', None, params)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_herds = json_response[u'herds']

        herds = []

        for json_herd in json_herds:
            herds.append(Herd(json_herd[u'name'], json_herd[u'id']))

        return herds


    #Requires current user to have admin rights
    def get_roles(self):

        result = self.__api_call('get', 'farm-roles/')

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_roles = json_response[u'roles']

        roles = []

        for json_role in json_roles:
            roles.append(Role(json_role[u'name'], json_role[u'id']))

        return roles


    #Requires current user to have admin rights
    def create_user(self, first_name, last_name, email, password, role):

        user_details = {'firstName': first_name, 'lastName': last_name, 'email': email, 'password': password, 'roleId': role.id}

        result = self.__api_call('post', 'users/', user_details)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_user = json_response[u'user']

        self.__mooogle_log(json_response[u'message'])

        return User(json_user[u'firstName'], json_user[u'lastName'], json_user[u'email'], json_user[u'id'])


    #Requires current user to have admin rights
    def remove_user(self, user):
        result = self.__api_call('delete', 'users/{}'.format(user.id))

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        return True


    #Requires current user to have admin rights to access all users. Any user can see other users in their farm
    def get_users(self, farm=None):

        params = None

        if farm is not None:
            params = {'farm': farm.id}

        result = self.__api_call('get', 'users/', None, params)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_users = json_response[u'users']

        users = []

        for json_user in json_users:
            users.append(User(json_user[u'firstName'], json_user[u'lastName'], json_user[u'email'], json_user[u'id']))

        return users


    def create_measurement_category(self, name):

        result = self.__api_call('post', 'measurement-categories/', {'name': name})

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_category = json_response[u'category']

        self.__mooogle_log(json_response[u'message'])

        return MeasurementCategory(json_category[u'name'], json_category[u'id'])


    def remove_measurement_category(self, category):
        result = self.__api_call('delete', 'measurement-categories/{}'.format(category.id))

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        return True


    def get_measurement_categories(self):

        result = self.__api_call('get', 'measurement-categories/')

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_categories = json_response[u'categories']

        categories = []

        for json_category in json_categories:
            categories.append(MeasurementCategory(json_category[u'name'], json_category[u'id']))

        return categories


    def get_measurement_category(self, categoryId):
        result = self.__api_call('get', 'measurement-categories/{}'.format(categoryId))

        if result.status_code != 200:
            return None

        json_category = result.json()[u'category']

        return MeasurementCategory(json_category[u'name'], json_category[u'id'])


    def create_algorithm(self, name, measurement_category):

        result = self.__api_call('post', 'algorithms/', {'name': name, 'measurementCategoryId': measurement_category.id})

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_algorithm = json_response[u'algorithm']

        self.__mooogle_log(json_response[u'message'])

        return Algorithm(json_algorithm[u'name'], json_algorithm[u'id'])


    def remove_algorithm(self, algorithm):
        result = self.__api_call('delete', 'algorithms/{}'.format(algorithm.id))

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        return True


    def get_algorithms(self, measurement_category=None):

        result = self.__api_call('get', 'algorithms/')

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_algorithms = json_response[u'algorithms']

        algorithms = []

        for json_algorithm in json_algorithms:
            algorithms.append(Algorithm(json_algorithm[u'name'],
                                        json_algorithm[u'id'],
                                        json_algorithm[u'MeasurementCategoryId']))

        return algorithms


    def get_algorithm(self, algorithmId):
        result = self.__api_call('get', 'algorithms/{}'.format(algorithmId))

        if result.status_code != 200:
            return None

        json_algorithm = result.json()[u'algorithm']

        return Algorithm(json_algorithm[u'name'], json_algorithm[u'id'], json_algorithm[u'MeasurementCategoryId'])


    def create_animal(self, farm, eid, vid=None, herd=None):

        animal_details = {'farmId': farm.id, 'eid': eid}

        if vid is not None:
            animal_details['vid'] = vid

        if herd is not None:
            animal_details['herdId'] = herd.id

        result = self.__api_call('post', 'animals/', animal_details)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_animal = json_response[u'animal']

        self.__mooogle_log(json_response[u'message'])

        return Animal(json_animal[u'id'],
                      json_animal[u'eid'],
                      json_animal[u'vid'],
                      json_animal[u'HerdId'],
                      json_animal[u'FarmId'])


    def set_animal_herd(self, animal, herd):

        if herd.farm_id != animal.farm_id:
            self.__mooogle_log("Cannot add animal to herd on different farm!")
            return False

        result = self.__api_call('put', 'animals/{}'.format(animal.id), {'herdId': herd.id})

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        animal.herd_id = herd.id

        return True


    def remove_animal(self, animal):
        result = self.__api_call('delete', 'animals/{}'.format(animal.id))

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        return True


    def get_animals(self, farm=None, herd=None):

        params = None

        if herd is not None:
            params = {'herd': herd.id}
        elif farm is not None:
            params = {'farm': farm.id}

        result = self.__api_call('get', 'animals/')

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_animals = json_response[u'animals']

        animals = []

        for json_animal in json_animals:
            animals.append(Animal(json_animal[u'id'],
                                  json_animal[u'eid'],
                                  json_animal[u'vid'],
                                  json_animal[u'HerdId'],
                                  json_animal[u'FarmId']))

        return animals


    def get_animal_by_eid(self, farm, eid):

        params = {'farm': farm.id, 'eid': urllib.quote_plus(eid)}

        result = self.__api_call('get', 'animals/', None, params)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_animals = json_response[u'animals']

        json_animal = json_animals[0]


        return Animal(  json_animal[u'id'],
                        json_animal[u'eid'],
                        json_animal[u'vid'],
                        json_animal[u'HerdId'],
                        json_animal[u'FarmId'])


    def update_animal_vid(self, animal, vid):

        result = self.__api_call('put', 'animals/{}'.format(animal.id), {'vid': vid})

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        animal.vid = vid

        return True


    def __create_measurement_with_details(self, measurement_details, value2=None, value3=None, value4=None, value5=None, comment=None):

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

        result = self.__api_call('post', 'measurements/', measurement_details)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_measurement = json_response[u'measurement']

        self.__mooogle_log(json_response[u'message'])

        result_measurement = Measurement()

        result_measurement.init_with_json(json_measurement)

        return result_measurement


    def create_measurement(self, animal, algorithm, user, time_stamp, value1, value2=None, value3=None, value4=None, value5=None, comment=None):

        measurement_details = {'animalId': animal.id, 'algorithmId': algorithm.id, 'userId': user.id, 'timeStamp': time_stamp, 'value1': value1}

        return self.__create_measurement_with_details(measurement_details, value2, value3, value4, value5, comment)


    def create_measurement_for_eid(self, eid, farm, algorithm, user, time_stamp, value1, value2=None, value3=None, value4=None, value5=None, comment=None):

        measurement_details = {'eid': eid, 'farmId': farm.id,'algorithmId': algorithm.id, 'userId': user.id, 'timeStamp': time_stamp, 'value1': value1}

        return self.__create_measurement_with_details(measurement_details, value2, value3, value4, value5, comment)


    def remove_measurement(self, measurement):
        result = self.__api_call('delete', 'measurements/{}'.format(measurement.id))

        json_response = result.json()

        self.__mooogle_log(json_response[u'message'])

        if result.status_code != 200:
            return False

        return True


    def get_measurements_for_animal(self, animal, algorithm=None):
        params = {'animal': animal.id}

        if algorithm is not None:
            params['algorithm'] = algorithm

        result = self.__api_call('get', 'measurements/', None, params)

        if result.status_code != 200:
            return None

        json_response = result.json()

        json_measurements = json_response[u'measurements']

        measurements = []

        for json_measurement in json_measurements:

            new_measurement = Measurement()
            new_measurement.init_with_json(json_measurement)
            measurements.append(new_measurement)

        return measurements


    def create_bulk_measurement_upload_list(self, animal, algorithm, user):
        return MeasurementList(animal, algorithm, user)


    def upload_measurement_list(self, measurement_list):

        result = self.__api_call('post', 'measurements/', measurement_list.get_json())

        if result.status_code != 200:
            return None

        return True