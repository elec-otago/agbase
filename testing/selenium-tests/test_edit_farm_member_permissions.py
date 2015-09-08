from end_to_end_test import EndToEndTest
import test_config as config

#=============================================================
# This tests that an account with permission to manage a farm 
# can edit another account farm permissions.
# Requires test farm, test farmer, and test farm manager to
# be created.  Requires test farmer to have farm management 
# permissions for test farm.  Requires farm manager to have
# farm management permissions for test farm.
#=============================================================
class EditFarmMemberPermissionTest(EndToEndTest):
    
    def test(self):
        print "TEST user edit farm permissions"
        
        # Login as test farmer
        self.login_user(config.test_farmer_email, config.test_password)
        
        # Navigate to the test farm page
        self.navigation.click_farms_dropdown_farm(config.test_farm)
        
        # Select farm members tab
        self.farm_page.click_members_tab()
        
        # Change farm manager's permissions to viewer
        self.farm_page.edit_farm_member_permission(config.test_manager_first, config.test_manager_last, config.viewer_permission)
        
        edited_user = self.farm_page.is_member_in_table(
            config.test_manager_first, 
            config.test_manager_last,
            config.viewer_permission)
        
        self.assertTrue(edited_user)