from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can delete another account management with farm management
# Permissions.
# Requires test farm, test farmer, and test farm manager to
# be created, and for test farmer and test manager to have farm
# management permissions
# TODO this test fails even though it should pass
#=============================================================
class UserDeleteFarmPermissionTest(EndToEndTest):
    
    def test(self):
        print "\nTEST user delete farm permission"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)
        
        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)
        
        # Select farm members tab
        self.farm_page.click_members_tab()
        
        # Delete farm manager
        self.farm_page.delete_member(config.test_manager_first, config.test_manager_last)
       
        deleted_user = self.farm_page.is_member_in_table(
            config.test_manager_first, 
            config.test_manager_last)
        
        self.assertFalse(deleted_user)
