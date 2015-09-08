from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can create a paddock through the farm page.
# Requires test farm and test farmerto be created.  Requires 
# test farmer to have farm management permissions for test farm.
#=============================================================
class CreateFarmPaddockTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user create farm paddock"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)
        
        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)
        
        # Select paddocks tab
        self.farm_page.click_paddocks_tab()
        
        # Create paddock
        self.farm_page.add_paddock(config.test_paddock_2, config.test_paddock_spreader_map_coords, config.farm_create_paddock_gmap_id)

        paddock_created = self.farm_page.is_paddock_in_table(config.test_paddock_2)

        self.assertTrue(paddock_created)