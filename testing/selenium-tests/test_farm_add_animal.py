from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can add an animal to that farm.
# Requires test farm, test farmer, and test herd 2 to be created 
# first.
#=============================================================
class UserAddFarmAnimalTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user add farm animal"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Click on animals tab
        self.farm_page.click_animals_tab()
        
        # Create new animal
        self.farm_page.create_animal(config.animal_eid, config.animal_vid, config.test_herd_2)
      
        # Check that the new herd was added
        added_animal = self.farm_page.is_animal_in_table(
            config.animal_eid,
            config.animal_vid,
            config.test_herd_2)
        self.assertTrue(added_animal)
