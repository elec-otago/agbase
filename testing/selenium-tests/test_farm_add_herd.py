from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can create a herd for that farm.
# Requires test farm and test farmer to be created first.
#=============================================================
class UserAddFarmHerdTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user add herd"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Click on herds tab
        self.farm_page.click_herds_tab()
        
        # Create new herd
        self.farm_page.click_create_herd()
        self.farm_page.dialog_enter_herd_name(config.test_herd_2)
        self.farm_page.click_dialog_create_herd()
        
        # Check that the new herd was added
        added_herd = self.farm_page.is_herd_in_table(config.test_herd_2)
        self.assertTrue(added_herd)
