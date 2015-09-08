from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can edit a herd through the farm page.
# Requires test farm, test farmer, and test herd 2 to
# be created.  Requires test farmer to have farm management 
# permissions for test farm.
#=============================================================
class EditFarmHerdNameTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user edit farm herd"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)
        
        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)
        
        # Select herds tab
        self.farm_page.click_herds_tab()
        
        # Change test herd name
        self.farm_page.edit_herd_name(config.test_herd_2, config.test_herd_two)
        
        edited_herd = self.farm_page.is_herd_in_table(config.test_herd_two)
       
        self.assertTrue(edited_herd)
        
        # Give the herd its original name to prevent later tests from failing
        self.farm_page.edit_herd_name(config.test_herd_two, config.test_herd_2)
        
        edited_herd = self.farm_page.is_herd_in_table(config.test_herd_2)
       
        self.assertTrue(edited_herd)