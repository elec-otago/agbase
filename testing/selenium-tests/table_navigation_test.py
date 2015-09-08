from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can remove an animal from that farm.
# Requires test farm and test farmer to be created first.
# Requires the add farm animal test to be successfully
# completed first.
#=============================================================
class TestNewDeleteFarmAnimal(EndToEndTest):

    def test(self):
        print "\nTable navigation test"
        
        # Login as test farmer
        self.login_user(config.test_admin_email, config.test_admin_password)

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown()
        self.navigation.click_farms_dropdown_farm(config.demo_farm)

        # Click on animals tab
        self.farm_page.click_animals_tab()

        # Delete animal
        self.farm_page.delete_animal_v2("982 123481455442", None, "")
