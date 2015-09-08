from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can add change the herd an animal belongs to.
# Requires test farm, test farmer, test herd, test herd 2, and
# an animal with animal_vid and animal_eid to be created 
# first.
#=============================================================
class UserEditFarmAnimalHerdTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user edit farm animal herd"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Click on animals tab
        self.farm_page.click_animals_tab()
        
        # Move animal to new herd
        self.farm_page.edit_animal_herd(config.animal_eid, config.animal_vid, config.test_herd_2, config.test_herd)
      
        # Check that the animal was moved to the new herd
        moved_animal = self.farm_page.is_animal_in_table(
            config.animal_eid,
            config.animal_vid,
            config.test_herd)
        
        self.assertTrue(moved_animal)