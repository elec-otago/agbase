import unittest
from mooglePy.moogle import Moogle
import time

__author__ = 'mark'


class TestHerd(unittest.TestCase):

    testUser = "unittest@moogle.elec.ac.nz"
    testPwd = "test"
    serverIp = "https://localhost:8443/api/"

    def setUp(self):
        self.moogle = Moogle()

        self.moogle.set_logging_on(True)

        self.user = self.moogle.connect(self.testUser, self.testPwd, self.serverIp)

        if self.user is None:
            self.fail()

        self.farm = self.moogle.create_farm("Python Test Farm")

    def tearDown(self):
        print('TestHerd.tearDown')
        self.moogle.remove_farm(self.farm)


    def test_get_nonexistent_herd(self):

        herds = self.moogle.get_herds(self.farm)

        if herds is not None and len(herds) != 0:
            self.fail()

        herd = self.moogle.create_herd(self.farm, "Python Test Herd")

        if herd is None:
            self.fail()

        herd2 = self.moogle.create_herd(self.farm, "Python Test Herd")

        if herd2 is None:
            self.fail()
            
        print herd2.id
            

    def test_herds(self):

        herd = self.moogle.create_herd(self.farm, "Python Test Herd")

        if herd is None:
            self.fail()

        print('created herd: {} with id: {}'.format(herd.name, herd.id))

        herds = self.moogle.get_herds()

        if herds is None:
            self.fail()

        for herd in herds:
            print('found herd: {} with id: {}'.format(herd.name, herd.id))

        herds = self.moogle.get_herds(self.farm)

        if herds is None:
            self.fail()

        for herd in herds:
            print('The farm "{}" has a herd named: {}'.format(self.farm.name, herd.name))

        deleted = self.moogle.remove_herd(herd)

        if not deleted:
            self.fail()



if __name__ == '__main__':
  suite = unittest.TestLoader().loadTestsFromTestCase(TestHerd)
  unittest.TextTestRunner(verbosity=2).run(suite)
