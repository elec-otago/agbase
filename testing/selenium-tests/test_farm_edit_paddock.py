from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can edit a paddock through the farm page.
# Requires test farm, test farmer, and test paddock 2 to
# be created.  Requires test farmer to have farm management 
# permissions for test farm.
# TODO: edit paddock borders as part of this test
#=============================================================
class EditFarmPaddockTest(EndToEndTest):
    
    def test(self):
        print "TEST user edit farm paddock"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)
        
        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)
        
        # Select paddock tab
        self.farm_page.click_paddocks_tab()
        
        # Change test paddock name        
        self.farm_page.edit_paddock_name(config.test_paddock_2, config.test_paddock_two)
        
        edited_paddock = self.farm_page.is_paddock_in_table(config.test_paddock_two)
       
        self.assertTrue(edited_paddock)
        
        # Give the paddock its original name to prevent later tests from failing
        self.farm_page.edit_paddock_name(config.test_paddock_two, config.test_paddock_2)
        
        edited_paddock = self.farm_page.is_paddock_in_table(config.test_paddock_2)
       
        self.assertTrue(edited_paddock)
        
        
        