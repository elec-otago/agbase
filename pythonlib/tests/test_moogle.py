import unittest
from mooglePy.moogle import Moogle
import time

__author__ = 'mark'


class TestMoogle(unittest.TestCase):

    testUser = "unittest@moogle.elec.ac.nz"
    testPwd = "test"
    serverIp = "https://moogle-test.elec.ac.nz/api/"


    def setUp(self):
        print('TestMoogle.setUp')
        super(self.__class__, self).setUp()

        self.moogle = Moogle()

        self.moogle.set_logging_on(True)

        self.user = self.moogle.connect(self.testUser, self.testPwd, self.serverIp)

        if self.user is None:
            self.fail()

        print('connected to mooogle with user: {} with id: {}'.format(self.user.email, self.user.id))


    def test_farms(self):

        test_farm = self.moogle.create_farm("Python Test Farm")

        if test_farm is None:
            self.fail()

        print('created farm: {} with id: {}'.format(test_farm.name, test_farm.id))

        farms = self.moogle.get_farms()

        if farms is None:
            self.fail()

        for farm in farms:
            print('found farm: {} with id: {}'.format(farm.name, farm.id))

        single_query_farm = self.moogle.get_farm(test_farm.id)

        if single_query_farm.id != test_farm.id:
            self.fail()

        farms = self.moogle.get_farms(self.user)

        if farms is None:
            self.fail()

        for farm in farms:
            print('The current user can access farm: {}'.format(farm.name))

        deleted = self.moogle.remove_farm(test_farm)

        if not deleted:
            self.fail()


    def test_roles(self):

        roles = self.moogle.get_roles()

        if roles is None:
            self.fail()

        for role in roles:
            print('Found role named {}'.format(role.name))


    def test_users(self):

        roles = self.moogle.get_roles()

        admin_role = None

        for role in roles:
            if role.name == "Viewer":
                admin_role = role
                break

        test_user = self.moogle.create_user("Mark", "Butler", "mark@tussockinnovation.co.nz", "trapezoid", admin_role)

        if test_user is None:
            self.fail()

        print('created user: {} with id: {}'.format(test_user.email, test_user.id))

        users = self.moogle.get_users()

        if users is None:
            self.fail()

        for user in users:
            print('found user: {} {} with email: {}'.format(user.first_name, user.last_name, user.email))

        deleted = self.moogle.remove_user(test_user)

        if not deleted:
            self.fail()


    def test_measurement_categories(self):

        test_category = self.moogle.create_measurement_category('Test Category')

        if test_category is None:
            self.fail()

        print('created measurement category: {} with id: {}'.format(test_category.name, test_category.id))

        single_query_category = self.moogle.get_measurement_category(test_category.id)

        if test_category.id != single_query_category.id:
            self.fail()

        categories = self.moogle.get_measurement_categories()

        if categories is None:
            self.fail()

        for category in categories:
            print('found category: {}'.format(category.name))

        deleted = self.moogle.remove_measurement_category(test_category)

        if not deleted:
            self.fail()


    def test_algorithms(self):

        test_category = self.moogle.create_measurement_category('Algorithm Test Category')
        test_algorithm = self.moogle.create_algorithm('Test Algorithm', test_category)

        if test_algorithm is None:
            self.fail()

        print('created algorithm {} with id: {}'.format(test_algorithm.name, test_algorithm.id))

        single_query_algorithm = self.moogle.get_algorithm(test_algorithm.id)

        if test_algorithm.id != single_query_algorithm.id:
            self.fail()

        algorithms = self.moogle.get_algorithms()

        if algorithms is None:
            self.fail()

        for algorithm in algorithms:
            print('found algorithm: {}'.format(algorithm.name))

        deleted = self.moogle.remove_algorithm(test_algorithm)

        if not deleted:
            self.fail()

        self.moogle.remove_measurement_category(test_category)


    def test_animals(self):

        test_farm = self.moogle.create_farm('Animal Test Farm')
        test_herd = self.moogle.create_herd(test_farm, 'Animal Test Herd')

        test_eid = "AN-EID-FOR_TESTING"

        test_animal = self.moogle.create_animal(test_farm, test_eid)

        if test_animal is None:
            self.fail()

        print('created animal {} with id: {}'.format(test_animal.eid, test_animal.id))

        result = self.moogle.set_animal_herd(test_animal, test_herd)

        if result is None:
            self.fail()

        animals = self.moogle.get_animals(test_farm, test_herd)

        if animals is None:
            self.fail()

        for animal in animals:
            print('found animal: {}'.format(animal.eid))

        updated = self.moogle.update_animal_vid(test_animal, "My Pet Cow")

        if not updated:
            self.fail()

        expected_animal = self.moogle.get_animal_by_eid(test_farm, test_eid)

        if expected_animal.id != test_animal.id:
            self.fail()

        deleted = self.moogle.remove_animal(test_animal)

        if not deleted:
            self.fail()

        self.moogle.remove_herd(test_herd)
        self.moogle.remove_farm(test_farm)


    def test_measurements(self):

        test_farm = self.moogle.create_farm('Animal Test Farm')
        test_eid = "AN-EID-FOR_TESTING"
        test_animal = self.moogle.create_animal(test_farm, test_eid)
        test_category = self.moogle.create_measurement_category('Algorithm Test Category')
        test_algorithm = self.moogle.create_algorithm('Test Algorithm', test_category)

        measurement = self.moogle.create_measurement(test_animal, test_algorithm, self.user, time.strftime("%c"), 0.3344)

        if measurement is None:
            self.fail()

        print('created measurement with id {}'.format(measurement.id))

        animal_measurements = self.moogle.get_measurements_for_animal(test_animal)

        if animal_measurements[0].id != measurement.id:
            self.fail()

        deleted = self.moogle.remove_measurement(measurement)

        if not deleted:
            self.fail()

        eid_measurement = self.moogle.create_measurement_for_eid(test_eid, test_farm, test_algorithm, self.user, time.strftime("%c"), 0.3344)

        if eid_measurement is None:
            self.fail()

        if eid_measurement.animal_id != test_animal.id:
            self.fail()

        self.moogle.remove_measurement(eid_measurement)

        self.moogle.remove_animal(test_animal)
        self.moogle.remove_farm(test_farm)
        self.moogle.remove_algorithm(test_algorithm)
        self.moogle.remove_measurement_category(test_category)


    def test_measurements_bulk_upload(self):

        test_farm = self.moogle.create_farm('Animal Test Farm')
        test_eid = "AN-EID-FOR_TESTING"
        test_animal = self.moogle.create_animal(test_farm, test_eid)
        test_category = self.moogle.create_measurement_category('Algorithm Test Category')
        test_algorithm = self.moogle.create_algorithm('Test Algorithm', test_category)

        measurement_list = self.moogle.create_bulk_measurement_upload_list(test_animal, test_algorithm, self.user)

        measurement_list.add_measurement(time.strftime("%c"), 0.3344)
        measurement_list.add_measurement(time.strftime("%c"), 0.4455)
        measurement_list.add_measurement(time.strftime("%c"), 0.5566)

        success = self.moogle.upload_measurement_list(measurement_list)

        if success is not True:
            self.fail()

        print('created bulk measurements')

        animal_measurements = self.moogle.get_measurements_for_animal(test_animal)

        if len(animal_measurements) != 3:
            self.fail()

        self.moogle.remove_animal(test_animal)
        self.moogle.remove_farm(test_farm)
        self.moogle.remove_algorithm(test_algorithm)
        self.moogle.remove_measurement_category(test_category)

if __name__ == '__main__':
  suite = unittest.TestLoader().loadTestsFromTestCase(TestMoogle)
  unittest.TextTestRunner(verbosity=2).run(suite)
