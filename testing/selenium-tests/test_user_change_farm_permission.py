from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can give another account management permissions.
# Requires test farm, test farmer, and test farm manager to
# be created first.
#=============================================================
class UserChangeFarmPermissionTest(EndToEndTest):
           
    def test(self):
        print "\nTEST user change farm permission"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)
    
        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)

        # Give farm manager ability to add new data
        self.farm_page.create_farm_permission(
            config.test_manager_first + " " + config.test_manager_last,
            config.manager_permission)
        
        has_permission = self.farm_page.is_member_in_table(
            config.test_manager_first, 
            config.test_manager_last,
            config.manager_permission)
        
        self.assertTrue(has_permission)