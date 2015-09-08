from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can remove a herd for that farm.
# Requires test farm, test farmer, and test herd 2 to be 
# created first.
#=============================================================
class UserDeleteFarmHerdTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user delete farm herd"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)

        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Click on herds tab
        self.farm_page.click_herds_tab()
        
        # delete test herd
        self.farm_page.click_delete_herd_btn(config.test_herd_2)
        self.farm_page.click_dialog_delete_herd()
        self.driver.implicitly_wait(10)
        # Check that the new herd was added
        deleted_herd = self.farm_page.is_herd_in_table(config.test_herd_2) == False
        self.assertTrue(deleted_herd)