from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can remove an animal from that farm.
# Requires test farm and test farmer to be created first.
# Requires the add farm animal test to be successfully
# completed first.
#=============================================================
class UserDeleteFarmAnimalTest(EndToEndTest):

    def test(self):
        print "\nTEST user delete farm animal"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Click on animals tab
        self.farm_page.click_animals_tab()

        # Delete animal
        self.farm_page.delete_animal(config.animal_eid, config.animal_vid, config.test_herd_2)

        # Check that the new animal was deleted.
        deleted_animal = self.farm_page.is_animal_in_table(
            config.animal_eid,
            config.animal_vid,
            config.test_herd_2)

        self.assertFalse(deleted_animal)